import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkBook } from 'xlsx';
import { read, utils, writeXLSX, writeFileXLSX } from 'xlsx';
import jspreadsheet from 'jspreadsheet';
import 'jspreadsheet/dist/jspreadsheet.css';
import prettyBytes from 'pretty-bytes';
import Layout from '@components/Layout';
import Section from '@components/Section';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { useFormik } from 'formik';
import * as zip from '@zip.js/zip.js';
import * as yup from 'yup';
import type { Theme } from '@mui/material';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
  Card,
  CardContent,
  TextField,
  Typography,
  CardActions,
  Stack,
  Box,
  Select,
  MenuItem,
  Chip,
  useTheme,
  IconButton,
  FormHelperText
} from '@mui/material';
import Button from '@mui/material-next/Button';
import { Icon } from '@iconify/react';
import { useWindowSize } from 'react-use';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getColCount,
  getRowCount,
  splitByCol,
  transferData,
  transferRange
} from '../../../utils/projectUtils';
import ProjectHeader from '../../../sections/project/Project.Header';
import list from '../../../utils/projects';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { encode_col, aoa_to_sheet, book_new, book_append_sheet } = utils;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

let conditionCache: Record<string, any[]> = {};

interface Values {
  type: 'row' | 'col';
  outputType: 'old' | 'new' | 'separate';
  titleLine: number;
  rowConditions?: Array<any>;
  colConditions?: number[][];
}

function getStyles(cur: number, value: number[], theme: Theme) {
  return {
    fontWeight:
      value.indexOf(cur) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

jspreadsheet.setLicense(
  'N2JlYzE3YmU1NDc0OTJlOWE4ZmUyMGY2ZjY4ZmIzM2Q5OGNlNjkxY2VmMGMwNjlkMDdkNWU3MWM5MjI3NTFiOTZmNzMxZGVhYmQ2YWYxOTk0MjUyMGQzNzUxODVhMTM5MWUzNjVjYzRiZmZkYzVjODQ2ZjI1OTQ4NjUxMjZmOGEsZXlKdVlXMWxJam9pWEhVNVlUZzFJaXdpWkdGMFpTSTZNVGN4TWpJM01UWXdNQ3dpWkc5dFlXbHVJanBiSW5kbFlpSXNJbXh2WTJGc2FHOXpkQ0pkTENKd2JHRnVJam93TENKelkyOXdaU0k2V3lKMk55SXNJblk0SWl3aWRqa2lMQ0oyTVRBaVhYMD0='
);
const defaultWorkbookConfig: Partial<jspreadsheet.Spreadsheet> = {
  tabs: false,
  worksheets: [{ minDimensions: [10, 30] }],
  contextMenu() {
    return false;
  },
  editable: false,
  allowDeleteWorksheet: true
};
const defaultSheetsConfig: Partial<jspreadsheet.Worksheet> = {
  tableHeight: '600px',
  minDimensions: [10, 30],
  tableOverflow: true,
  resize: 'both',
  rowResize: true,
  columnResize: true
};

const validationSchema: yup.ObjectSchema<Values> = yup.object({
  type: yup.string().oneOf(['col', 'row']).required('请选择拆分方式'),
  outputType: yup.string().oneOf(['old', 'new', 'separate']).required('请选择输出方式'),
  titleLine: yup.number().required('请选择标题行').min(0),
  colConditions: yup.array().when('type', {
    is: 'col',
    then: schema =>
      schema.of(
        yup
          .array()
          .of(yup.number().min(0))
          .test({
            name: 'unique',
            test(value, context) {
              let isValid = true;
              const cache: Record<string, number[]> = {};
              (context.parent as Array<number | number[]>).forEach((g, i) => {
                if (!g) {
                  return;
                }
                const key = Array.isArray(g) ? g.sort().join(',') : g;
                if (cache[key]) {
                  cache[key].push(i);
                  isValid = false;
                } else {
                  cache[key] = [i];
                }
              });
              if (isValid) {
                return true;
              }
              const repeat = Object.values(cache).filter(v => v.length > 1);
              console.log('repeat', JSON.stringify(repeat));
              return context.createError({
                message: repeat.map(v => `分组${v.map(j => j + 1).join('、')}重复`).join('，')
              });
            }
          })
      )
  }),
  rowConditions: yup.array().when('type', {
    is: 'row',
    then: schema => schema.of(yup.object({ condition: yup.array().of(yup.string()) }))
  })
});

const SplitTable: FC = () => {
  const theme = useTheme();
  const jssRef = useRef<HTMLDivElement>(null);
  const jssheetRef = useRef<jspreadsheet.worksheetInstance[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);
  const { width } = useWindowSize();
  const [colOptions, setColOptions] = useState<{ value: number; text: string }[]>([]);

  const submit = useCallback(
    async (values: Values) => {
      const { type, outputType, titleLine, rowConditions, colConditions = [] } = values;
      if (!workbook || !sheetName) {
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        const data = sheet['!data'];
        if (type === 'col') {
          const result = splitByCol(data!, colConditions);
          const newSheets = result.map(d => aoa_to_sheet(d));
          switch (outputType) {
            case 'old': {
              break;
            }
            case 'new': {
              const newWorkbook = book_new();
              newSheets.forEach((s, i) => {
                book_append_sheet(newWorkbook, s, `分组${i + 1}`);
              });
              break;
            }
            case 'separate': {
              const newWorkbooks = newSheets.map((s, i) => {
                const book = book_new();
                book_append_sheet(book, s, `分组${i + 1}`);
                return book;
              });
              const zipFile = new zip.BlobWriter('application/zip');
              const zipWriter = new zip.ZipWriter(zipFile, {
                bufferedWrite: true
              });
              await Promise.all(
                newWorkbooks.map(async (book, i) =>
                  zipWriter.add(
                    `分组${i + 1}.xlsx`,
                    new zip.Uint8ArrayReader(writeXLSX(book, { type: 'array' }))
                  )
                )
              );
              const blob = await zipWriter.close();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = '分组.zip';
              a.click();
              URL.revokeObjectURL(url);
              break;
            }
            default:
              break;
          }
        }
      }
    },
    [workbook, sheetName]
  );
  const formik = useFormik<Values>({
    onSubmit: submit,
    initialValues: { type: 'row', outputType: 'old', titleLine: 1 },
    validationSchema
  });
  console.log(formik.errors);

  const upload = useCallback(async (files: File[]) => {
    const [incomeFile] = files;
    if (!incomeFile) {
      return;
    }
    setFile(incomeFile);
    const data = await incomeFile.arrayBuffer();
    const wb = read(data, { dense: true });
    setWorkbook(wb);
    setSheetName(wb?.SheetNames?.[0] || null);
    conditionCache = {};
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: upload,
    accept: {
      'application/vnd.ms-excel': [],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'text/csv': []
    },
    noKeyboard: true,
    multiple: false
  });

  useEffect(() => {
    let { titleLine } = formik.values;
    if (workbook && sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const rowCount = getRowCount(sheet);
      if (rowCount < formik.values.titleLine) {
        titleLine = rowCount + 1;
      } else if (formik.values.titleLine < 0) {
        titleLine = 0;
      }
      formik.setFieldValue('titleLine', titleLine);
      formik.setFieldValue('colConditions', []);
      formik.setFieldValue('rowConditions', []);
      if (titleLine === 0) {
        setColOptions(
          Array.from({ length: getColCount(sheet) + 1 }).map((_, i) => {
            return { value: i, text: `第${encode_col(i)}列` };
          })
        );
      } else {
        const titleRow = sheet['!data']?.[titleLine - 1];
        setColOptions(
          Array.from({ length: getColCount(sheet) + 1 }).map((_, i) => {
            const title = titleRow?.[i]?.v;
            return {
              value: i,
              text: title ? `${title}(${encode_col(i)})` : `第${encode_col(i)}列`
            };
          })
        );
      }
    }
  }, [formik.values.titleLine, workbook, sheetName]);

  useEffect(() => {
    if (workbook && sheetName) {
      if (conditionCache[sheetName]) {
        formik.setFieldValue('rowConditions', conditionCache[sheetName][0], false);
        formik.setFieldValue('colConditions', conditionCache[sheetName][1], false);
      }
      const sheet = workbook.Sheets[sheetName];
      const style: Record<string, string> = {};
      if (formik.values.titleLine > 1) {
        style[`A1:Z${formik.values.titleLine - 1}`] =
          'background-image: linear-gradient(135deg,#cccccc 3.85%,#f0f0f0 3.85%,#f0f0f0 50%,#cccccc 50%,#cccccc 53.85%,#f0f0f0 53.85%,#f0f0f0 100%);background-size: 13px 13px;';
      }
      if (formik.values.titleLine > 0) {
        style[`A${formik.values.titleLine}:Z${formik.values.titleLine}`] =
          'background-color: #f7f5ff;font-weight: 600;';
      }
      const sheets: jspreadsheet.Worksheet[] = [
        {
          ...defaultSheetsConfig,
          worksheetName: sheetName,
          mergeCells: transferRange(sheet['!merges']),
          data: transferData(sheet),
          style
        }
      ];
      const sheetsInstances = jspreadsheet(jssRef.current!, {
        ...defaultWorkbookConfig,
        worksheets: sheets
      });
      jssheetRef.current = sheetsInstances;
      sheetsInstances.forEach(instance => {
        instance.autoWidth(instance.colgroup.map((_, i) => i));
      });
    }
    return () => {
      jspreadsheet.destroy(jssRef.current!);
      jssheetRef.current = null;
    };
  }, [workbook, sheetName, formik.values.titleLine]);

  useEffect(() => {
    jssheetRef.current?.forEach(instance => {
      instance.setViewport(
        Math.min(width - 40, instance.width || Infinity),
        Math.min(instance.height || Infinity, 600)
      );
    });
  }, [width]);

  useEffect(() => {
    if (sheetName) {
      conditionCache[sheetName] = [formik.values.rowConditions, formik.values.colConditions];
    }
  }, [sheetName, formik.values.rowConditions, formik.values.colConditions]);

  const getTextFromCol = useCallback(
    (v: number) => colOptions.find(({ value }) => v === value)?.text || String(v),
    [colOptions]
  );

  return (
    <Layout>
      <ProjectHeader title={list[4].name} description={list[4].description} />
      <Section narrow className="text-palette-secondary">
        <section className="flex flex-col">
          <div
            {...getRootProps({
              className: clsx(
                'flex flex-1 flex-col items-center bg-palette-gray/10 text-palette-primary/60 cursor-pointer',
                'border-2 border-dashed border-palette-gray p-5 focus:border-palette-accent/80 rounded-md'
              )
            })}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>
                <Icon icon="ri:drag-drop-line" className="mr-2" />
                把文件拖拽到这里
              </p>
            ) : (
              <p>
                <Icon icon="ri:drag-drop-line" className="mr-2" />
                拖拽文件到这里，或点击选择文件
              </p>
            )}
          </div>
          <div className="my-5 text-sm leading-6">
            {file && (
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Icon className="!h-6 !w-6" icon="vscode-icons:file-type-excel2" />
                  </ListItemIcon>
                  <ListItemText primary={file.name} secondary={prettyBytes(file.size)} />
                </ListItem>
              </List>
            )}
          </div>
        </section>
      </Section>
      {workbook && sheetName && (
        <>
          <Section narrow className="my-10">
            <form onSubmit={formik.handleSubmit}>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormLabel component="legend">表格拆分方式</FormLabel>
                  <RadioGroup
                    row
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel value="row" control={<Radio />} label="按行拆分" />
                    <FormControlLabel value="col" control={<Radio />} label="按列拆分" />
                  </RadioGroup>
                </FormGroup>
                <FormGroup sx={{ mt: 4 }}>
                  <FormLabel component="legend">导出方式</FormLabel>
                  <RadioGroup
                    row
                    name="outputType"
                    value={formik.values.outputType}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel
                      value="old"
                      control={<Radio />}
                      label="在原文件中附加新表格"
                    />
                    <FormControlLabel
                      value="new"
                      control={<Radio />}
                      label="新表格保存到新文件中"
                    />
                    <FormControlLabel
                      value="separate"
                      control={<Radio />}
                      label="每个新表格保存到独立的文件中"
                    />
                  </RadioGroup>
                </FormGroup>
                <FormGroup sx={{ mt: 4, mb: 8 }}>
                  <FormLabel component="legend">标题行</FormLabel>
                  <TextField
                    name="titleLine"
                    value={formik.values.titleLine}
                    onChange={formik.handleChange}
                    type="number"
                    margin="none"
                    size="small"
                    className="w-20"
                    id="titleLine"
                  />
                </FormGroup>
              </FormControl>
              {formik.values.type === 'row' && (
                <Card>
                  <CardContent>按行拆分</CardContent>
                </Card>
              )}

              {formik.values.type === 'col' && (
                <Card>
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      按列拆分
                    </Typography>
                    <Stack spacing={1}>
                      <AnimatePresence>
                        {formik.values.colConditions?.map((condition, i) => (
                          <motion.div
                            key={String(i + 1)}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <Box display="flex" alignItems="center" gap={2} paddingX={2}>
                              <span>分组-{i + 1}: </span>
                              <FormControl sx={{ m: 1, flex: 1 }}>
                                <Select
                                  labelId={`col-condition-group-${i}`}
                                  multiple
                                  size="small"
                                  name={`colConditions[${i}]`}
                                  value={condition || []}
                                  onChange={formik.handleChange}
                                  renderValue={selected => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {selected.map(value => (
                                        <Chip
                                          key={value}
                                          label={getTextFromCol(value)}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  )}
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                        width: 250
                                      }
                                    }
                                  }}
                                >
                                  {colOptions.map(({ value, text }) => (
                                    <MenuItem
                                      key={text + value}
                                      value={value}
                                      style={getStyles(value, condition, theme)}
                                    >
                                      {text}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <IconButton
                                onClick={() =>
                                  formik.setFieldValue(
                                    'colConditions',
                                    (formik.values.colConditions || []).filter(
                                      (_, index) => index !== i
                                    )
                                  )
                                }
                              >
                                <Icon icon="ic:baseline-delete-forever" />
                              </IconButton>
                            </Box>
                            <FormHelperText error sx={{ paddingLeft: 12 }}>
                              {formik.errors.colConditions?.[i]}
                            </FormHelperText>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Icon icon="solar:add-circle-broken" />}
                      onClick={() =>
                        formik.setFieldValue(
                          'colConditions',
                          (formik.values.colConditions || []).concat([[]])
                        )
                      }
                    >
                      添加分组
                    </Button>
                  </CardActions>
                </Card>
              )}
              <div className="my-8 flex w-full justify-center">
                <Button
                  variant="filledTonal"
                  disableElevation
                  type="submit"
                  size="large"
                  startIcon={<Icon icon="lucide:table-rows-split" />}
                >
                  拆分表格
                </Button>
              </div>
            </form>
          </Section>
          <Tabs
            value={sheetName}
            onChange={(e, value) => setSheetName(value)}
            variant="scrollable"
            scrollButtons="auto"
            className="ml-5 w-[calc(100vw-40px)]"
          >
            {workbook.SheetNames.map(name => (
              <Tab wrapped={name.length > 15} key={name} value={name} label={name} />
            ))}
          </Tabs>
        </>
      )}
      <div
        className="mx-auto flex w-[calc(100vw-40px)] items-center justify-center text-xs dark:invert"
        onKeyDownCapture={e => e.stopPropagation()}
      >
        {workbook?.Sheets[sheetName || ''] && <div ref={jssRef} />}
      </div>
    </Layout>
  );
};

export default SplitTable;
