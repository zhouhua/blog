const ShadowText: FC<{ text: string; fontSize: number }> = ({ text, fontSize = 50 }) => (
  <div>
    {text.split('').map(char => (
      <span
        className="text-palette-bg font-monospace"
        style={{
          textShadow: `-${(12 / 50) * fontSize}px ${(5 / 50) * fontSize}px ${
            (15 / 50) * fontSize
          }px rgb(var(--color-gray))`,
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.12em'
        }}
      >
        {char}
      </span>
    ))}
  </div>
);

export default ShadowText;
