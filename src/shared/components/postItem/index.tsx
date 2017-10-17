import * as React from "react";
import { observer } from "mobx-react";
import Post from "model/Post";
import TopicStore from "store/TopicStore";
import { Link } from "react-router-dom";
import { Tooltip, Button } from "element-react/next";
import { getTimeDiff, getLocalDate } from "utils/DateTimeKit";
import { Parser as HtmlToReactParser } from "html-to-react";

const styles = require("./index.less");

const defaultAvatar = require("IMG/avatar-default.png");

interface PostItemProps {
    post: Post;
    store: TopicStore;
    goReply: (post: Post) => void;
}

interface PostItemState {}

@observer
export default class PostItem extends React.Component<
    PostItemProps,
    PostItemState
> {
    constructor(props) {
        super(props);
    }

    goReply = () => {
        const { goReply, post } = this.props;
        goReply(post);
    };

    render() {
        // const parent = posts.find(x => x.id === post.pid);
        const htmlToReactParser = new HtmlToReactParser();

        const { post, store } = this.props;
        const { topic } = store;
        const { posts } = store;

        const replies = posts.filter(x => x.id === post.pid);
        return (
            <div className={styles.postItem} id={`post-${post.id}`}>
                <div className={styles.inner}>
                    <header>
                        <ul>
                            <li className={styles.author}>
                                <h3>
                                    <Link to={`/u/${post.authorName}`}>
                                        <span className={styles.avatar}>
                                            <img
                                                src={
                                                    post.author.avatar ||
                                                    defaultAvatar
                                                }
                                            />
                                        </span>
                                        <span className={styles.username}>
                                            {post.authorName}
                                        </span>
                                    </Link>
                                </h3>
                            </li>
                            <li className={styles.meta}>
                                <Tooltip
                                    effect="dark"
                                    placement="top"
                                    content={getLocalDate(
                                        new Date(post.createTime * 1000)
                                    ).toLocaleString()}
                                >
                                    <span>
                                        {getTimeDiff(
                                            new Date(post.createTime * 1000)
                                        )}
                                    </span>
                                </Tooltip>
                            </li>
                            {topic.authorId === post.authorId && (
                                <li className={styles.idBadge}>
                                    <span>楼主</span>
                                </li>
                            )}
                        </ul>
                    </header>
                    <div className={styles.postBody}>
                        {htmlToReactParser.parse(post.contentHtml)}
                    </div>
                    <aside className={styles.postActions}>
                        <ul>
                            <li className={styles.replyBtn}>
                                <Button type="text" onClick={this.goReply}>
                                    回复
                                </Button>
                            </li>
                        </ul>
                    </aside>
                    <footer>
                        <ul>
                            {!!replies &&
                                replies.length > 0 &&
                                replies.map((reply, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className={styles.reply}
                                        >
                                            <a href={`#post-${reply.id}`}>
                                                <i className="icon fa fa-fw fa-reply" />
                                                <Link
                                                    to={`/u/${reply.authorName}`}
                                                >
                                                    {reply.authorName}
                                                </Link>{" "}
                                                回复了它
                                            </a>
                                        </li>
                                    );
                                })}
                        </ul>
                    </footer>
                </div>
            </div>
        );
    }
}