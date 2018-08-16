import React from 'react';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import buildDistanceInWordsLocaleZHCN from 'date-fns/locale/zh_cn/build_distance_in_words_locale/index';
import 'github-markdown-css/github-markdown.css';
import Avatar from './avatar';
import Svg from './svg';

const ZHCN = buildDistanceInWordsLocaleZHCN();
const GTI18nDistanceInWordsLocaleMap = {
  'zh': ZHCN,
  'zh-CN': ZHCN
};

export default ({
  comment,
  user,
  language,
  commentedText = '',
  admin = [],
  replyCallback,
  likeCallback
}) => {
  const enableEdit = user && comment.user.login === user.login;
  const isAdmin = [].concat(admin).some(id => id.toLowerCase() === comment.user.login.toLowerCase());
  const reactions = comment.reactions;

  let reactionTotalCount = '';
  if (reactions && reactions.totalCount) {
    reactionTotalCount = reactions.totalCount;
    if (reactions.totalCount === 100 && reactions.pageInfo && reactions.pageInfo.hasNextPage) {
      reactionTotalCount = '100+';
    }
  }

  return (
    <div className={`gt-comment ${isAdmin ? 'gt-comment-admin' : ''}`}>
      <Avatar
        className="gt-comment-avatar"
        src={comment.user && comment.user.avatar_url}
      />

      <div className="gt-comment-content">
        <div className="gt-comment-header">
          <a
            className="gt-comment-username"
            href={comment.user && comment.user.html_url}
          >
            {comment.user && comment.user.login}
          </a>
          <span className="gt-comment-text">
            {commentedText}
          </span>
          <span className="gt-comment-date">
            {distanceInWordsToNow(comment.created_at, {
              addSuffix: true,
              locale: { distanceInWords: GTI18nDistanceInWordsLocaleMap[language] }
            })}
          </span>

          {reactions &&
            <a className="gt-comment-like" onClick={likeCallback}>
              {reactions.viewerHasReacted ?
                <Svg className="gt-ico-heart" name="heart_on" text={reactionTotalCount} /> :
                <Svg className="gt-ico-heart" name="heart" text={reactionTotalCount} />
              }
            </a>
          }

          {enableEdit ?
            <a href={comment.html_url} className="gt-comment-edit" target="_blank">
              <Svg className="gt-ico-edit" name="edit" />
            </a> :
            <a className="gt-comment-reply" onClick={replyCallback}>
              <Svg className="gt-ico-reply" name="reply" />
            </a>
          }
        </div>
        <div
          className="gt-comment-body markdown-body"
          dangerouslySetInnerHTML={{ __html: comment.body_html }}
        />
      </div>
    </div>
  );
};
