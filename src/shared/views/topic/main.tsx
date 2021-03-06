import * as React from "react";
import { observer } from "mobx-react";
import ClassNames from "classnames";
import DocumentMeta from "react-document-meta";
import PostItem from "components/postItem";
import TopicStore from "store/TopicStore";
import GlobalStore from "store/GlobalStore";
import LocalEditor from "components/editor";
import PostEditor from "components/postEditor";
import { Tooltip, Button, Message } from "element-react/next";
import { getTimeDiff, getGMT8DateStr } from "utils/DateTimeKit";
import { Link } from "react-router-dom";
import Post from "model/Post";
import Avatar from "components/avatar";
import { sanitize } from "utils/HtmlKit";
import { CopyToClipboard } from "react-copy-to-clipboard";
import moment from "moment";

const styles = require("./styles/main.less");

const defaultAvatar = require("IMG/avatar-default.png");

interface TopicMainProps {
    store: TopicStore;
}

interface TopicMainState {
    commentting: boolean;
    editingTopic: boolean;
}

@observer
export default class TopicMain extends React.Component<
    TopicMainProps,
    TopicMainState
> {
    private postBox: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            commentting: false,
            editingTopic: false
        };
    }

    refPostBox = box => {
        this.postBox = box;
    };

    goComment = () => {
        this.props.store.goComment();
        this.postBox.scrollIntoView();
        this.toggleCommentting(true);
    };

    goReply = (post: Post) => {
        this.props.store.goReply(post);
        this.postBox.scrollIntoView();
        this.toggleCommentting(true);
    };

    refTopicLink = () => {
        Message({
            message: "已成功复制话题链接",
            type: "success"
        });
    };

    toggleCommentting = (status: boolean) => {
        this.setState({
            commentting: status
        });
    };

    submitPost = () => {
        const { store } = this.props;
        store
            .createPost()
            .then(() => {
                Message({
                    message: "发布评论成功",
                    type: "success"
                });
                this.toggleCommentting(false);
            })
            .catch(() => {
                Message({
                    message: "创建话题失败",
                    type: "error"
                });
            });
    };

    toggleTopicEditing = (status: boolean) => {
        this.setState({
            editingTopic: status
        });
    };

    updateTopic = () => {
        const { store } = this.props;
        store
            .submitEditTopic()
            .then(() => {
                Message({
                    message: "更新话题成功",
                    type: "success"
                });
                this.setState({
                    editingTopic: false
                });
            })
            .catch(err => {
                Message({
                    message: err.message || err.toString(),
                    type: "error"
                });
            });
    };

    followTopic = () => {
        const { store } = this.props;
        const { topic } = store;
        const { id } = topic;
        return GlobalStore.Instance
            .followTopic(id)
            .then(() => {
                Message({
                    message: "关注话题成功",
                    type: "success"
                });
            })
            .catch(() => {
                Message({
                    message: "关注话题失败",
                    type: "error"
                });
            });
    };

    unfollowTopic = () => {
        const { store } = this.props;
        const { topic } = store;
        const { id } = topic;
        return GlobalStore.Instance
            .unfollowTopic(id)
            .then(() => {
                Message({
                    message: "取消关注成功",
                    type: "success"
                });
            })
            .catch(() => {
                Message({
                    message: "取消关注失败",
                    type: "error"
                });
            });
    };

    stickyTopic = () => {
        const { store } = this.props;
        const { stickyTopic } = store;
        return stickyTopic()
            .then(() => {
                Message({
                    message: "置顶话题成功",
                    type: "success"
                });
            })
            .catch(() => {
                Message({
                    message: "置顶话题失败",
                    type: "error"
                });
            });
    };

    unStickyTopic = () => {
        const { store } = this.props;
        const { unStickyTopic } = store;
        return unStickyTopic()
            .then(() => {
                Message({
                    message: "取消置顶话题成功",
                    type: "success"
                });
            })
            .catch(() => {
                Message({
                    message: "取消置顶话题失败",
                    type: "error"
                });
            });
    };

    componentDidMount() {
        const { store } = this.props;
        GlobalStore.Instance.userPromise.then(() => {
            store.checkFavoriteStatus();
            store.checkLikeStatus();
            store.syncLikePostsCache();
        });
    }

    renderMainThread = () => {
        const { store } = this.props;
        const {
            topic,
            hasFavorited,
            favoriteActing,
            hasLiked,
            likeActing,
            canEditTopic,
            submittingEditTopic,
            canStickyTopic,
            stickyActing
        } = store;
        const { isPinned } = topic;
        const { editingTopic } = this.state;
        const me = GlobalStore.Instance.user;
        const { switchingFollowTopicStatus } = GlobalStore.Instance;
        const followTopicIds = me ? me.followingTopicIds : [];

        return (
            <div className={styles.topicWrapper} id="thread">
                <div className={styles.inner}>
                    <header>
                        <ul>
                            <li className={styles.author}>
                                <h3>
                                    <Link to={`/u/${topic.authorName}`}>
                                        <Avatar
                                            className={styles.avatar}
                                            user={topic.author}
                                        />
                                        <span className={styles.username}>
                                            {topic.author.nickname}
                                        </span>
                                    </Link>
                                </h3>
                            </li>
                            <li className={styles.meta}>
                                <Tooltip
                                    effect="dark"
                                    placement="top"
                                    content={getGMT8DateStr(
                                        moment(topic.createTime * 1000)
                                    )}
                                >
                                    <span>
                                        {getTimeDiff(
                                            moment(topic.createTime * 1000)
                                        )}
                                    </span>
                                </Tooltip>
                            </li>
                            {!!topic.updateTime && (
                                <li className={styles.meta}>
                                    <Tooltip
                                        effect="dark"
                                        placement="top"
                                        content={getGMT8DateStr(
                                            moment(topic.updateTime * 1000)
                                        )}
                                    >
                                        <span>
                                            <span className={styles.dot}>·</span>{" "}
                                            更新于
                                            {getTimeDiff(
                                                moment(topic.updateTime * 1000)
                                            )}
                                        </span>
                                    </Tooltip>
                                </li>
                            )}
                            {/* <li className={styles.idBadge}>
                                <span>楼主</span>
                            </li> */}
                            {(function(that) {
                                if (!canStickyTopic) {
                                    return null;
                                }
                                return (
                                    <li className={styles.editActions}>
                                        <Button
                                            type="text"
                                            onClick={
                                                isPinned
                                                    ? that.unStickyTopic
                                                    : that.stickyTopic
                                            }
                                        >
                                            {stickyActing && (
                                                <i className="el-icon-loading" />
                                            )}
                                            {isPinned ? "取消置顶" : "置顶"}
                                        </Button>
                                    </li>
                                );
                            })(this)}
                            {(function(that) {
                                if (!canEditTopic) {
                                    return null;
                                }
                                return editingTopic ? (
                                    <li className={styles.editActions}>
                                        <a
                                            href="javascript:;"
                                            onClick={that.toggleTopicEditing.bind(
                                                that,
                                                false
                                            )}
                                        >
                                            取消
                                        </a>
                                        <Button
                                            type="success"
                                            size="small"
                                            onClick={that.updateTopic}
                                            loading={submittingEditTopic}
                                        >
                                            更新
                                        </Button>
                                    </li>
                                ) : (
                                    <li className={styles.editActions}>
                                        <a
                                            href="javascript:;"
                                            onClick={that.toggleTopicEditing.bind(
                                                that,
                                                true
                                            )}
                                            className={styles.goEditTopic}
                                        >
                                            编辑
                                        </a>
                                    </li>
                                );
                            })(this)}
                        </ul>
                    </header>
                    {editingTopic ? (
                        <div className={styles.topicBodyEditing}>
                            <LocalEditor
                                rawContent={topic.contentRaw}
                                onChange={store.editTopic}
                            />
                        </div>
                    ) : (
                        <div
                            className={styles.topicBody}
                            dangerouslySetInnerHTML={{
                                __html: sanitize(topic.contentHtml)
                            }}
                        />
                    )}
                    <aside className={styles.asideActions}>
                        <ul>
                            <li className={styles.replyBtn}>
                                {followTopicIds.includes(topic.id) && (
                                    <Button
                                        type="text"
                                        onClick={this.unfollowTopic}
                                    >
                                        {switchingFollowTopicStatus && (
                                            <i className="el-icon-loading" />
                                        )}取消关注
                                    </Button>
                                )}
                                {!followTopicIds.includes(topic.id) && (
                                    <Button
                                        type="text"
                                        onClick={this.followTopic}
                                    >
                                        {switchingFollowTopicStatus && (
                                            <i className="el-icon-loading" />
                                        )}关注
                                    </Button>
                                )}

                                <Button type="text" onClick={this.goComment}>
                                    回复
                                </Button>
                                <CopyToClipboard
                                    text={`${GlobalStore.Instance.getRefUrl()}#thread`}
                                    onCopy={this.refTopicLink}
                                >
                                    <Button type="text">
                                        <i
                                            title="引用"
                                            className="fa fa-fw fa-link"
                                        />
                                    </Button>
                                </CopyToClipboard>
                            </li>
                        </ul>
                    </aside>
                    <footer>
                        <div className={styles.actions}>
                            <ul>
                                <li className={styles.views}>
                                    <i className="fa fa-eye" />
                                    <span className={styles.count}>
                                        {topic.viewsCount}
                                    </span>次浏览
                                </li>
                                <li
                                    className={styles.favorite}
                                    onClick={store.handleFavorite}
                                >
                                    <i
                                        className={
                                            favoriteActing
                                                ? "el-icon-loading"
                                                : hasFavorited
                                                  ? "el-icon-star-on"
                                                  : "el-icon-star-off"
                                        }
                                    />
                                    <span className={styles.count}>
                                        {topic.favoritesCount}
                                    </span>收藏
                                </li>
                                <li
                                    className={styles.upvote}
                                    onClick={store.handleLike}
                                >
                                    <i
                                        className={
                                            likeActing
                                                ? "el-icon-loading"
                                                : hasLiked
                                                  ? "fa fa-heart"
                                                  : "fa fa-heart-o"
                                        }
                                    />
                                    <span className={styles.count}>
                                        {topic.upvotesCount}
                                    </span>喜欢
                                </li>
                            </ul>
                        </div>
                    </footer>
                </div>
            </div>
        );
    };

    renderPostList = () => {
        const { store } = this.props;
        const { loading, postsLoading, posts, hasMorePosts } = store;
        return (
            <div className={styles.postListWrapper}>
                <ul className={styles.postList}>
                    {posts.map((post, index) => {
                        return (
                            <li key={index} id={`reply${index + 1}`}>
                                <PostItem
                                    index={index}
                                    post={post}
                                    store={store}
                                    goReply={this.goReply}
                                />
                            </li>
                        );
                    })}
                </ul>
                {!loading &&
                    postsLoading && (
                        <div className={styles.postsLoading}>
                            <i className="el-icon-loading" />
                        </div>
                    )}
                {!postsLoading &&
                    hasMorePosts && (
                        <div className={styles.loadMore}>
                            <Button onClick={store.getNextPagePosts}>
                                载入更多
                            </Button>
                        </div>
                    )}
            </div>
        );
    };

    renderPostBox = () => {
        const { store } = this.props;
        const {
            loading,
            postsLoading,
            topic,
            mentions,
            postBtnDisabled,
            submittingPost,
            postEditorState
        } = store;
        const { commentting } = this.state;
        const globalStore = GlobalStore.Instance;
        const { user, showLoginAuthModal } = globalStore;
        if (loading || postsLoading) {
            return null;
        }

        if (user && commentting) {
            return (
                <div
                    ref={this.refPostBox}
                    className={ClassNames(
                        [styles.commentPlaceholder],
                        [styles.commentEditorWrapper]
                    )}
                    suppressContentEditableWarning
                >
                    <div className={styles.inner}>
                        <header>
                            <span className={styles.avatar}>
                                <Tooltip
                                    effect="dark"
                                    placement="top"
                                    content={user.nickname}
                                >
                                    <img src={user.avatar || defaultAvatar} />
                                </Tooltip>
                            </span>
                        </header>
                        <div className={styles.commentEditBody}>
                            <ul>
                                <li>
                                    <h3>
                                        <i className="icon fa fa-fw fa-reply" />{" "}
                                        <span>{topic.title}</span>
                                    </h3>
                                </li>
                                <span
                                    className={styles.close}
                                    onClick={this.toggleCommentting.bind(
                                        this,
                                        false
                                    )}
                                >
                                    <i className="el-icon-close" />
                                </span>
                            </ul>
                            <PostEditor
                                className={styles.commentEditor}
                                toolBarClassName={styles.commentEditorToolbar}
                                editorState={postEditorState}
                                placeholder="输入评论"
                                mentions={mentions}
                                onChange={store.postEditorStateChange}
                            />
                        </div>
                        <footer>
                            <Button
                                type="primary"
                                disabled={postBtnDisabled}
                                onClick={this.submitPost}
                            >
                                发表评论
                                {submittingPost && (
                                    <i className="el-icon-loading el-icon-right" />
                                )}
                            </Button>
                        </footer>
                    </div>
                </div>
            );
        }

        return (
            <div ref={this.refPostBox} className={styles.commentPlaceholder}>
                {(function(that) {
                    if (user && user.id) {
                        return (
                            <div className={styles.inner}>
                                <header
                                    onClick={that.toggleCommentting.bind(
                                        that,
                                        true
                                    )}
                                >
                                    <span className={styles.avatar}>
                                        <img
                                            src={user.avatar || defaultAvatar}
                                        />
                                    </span>
                                    说点什么...
                                </header>
                            </div>
                        );
                    } else {
                        return (
                            <div
                                className={styles.inner}
                                onClick={showLoginAuthModal}
                            >
                                <header>
                                    <span className={styles.avatar}>
                                        <img src={defaultAvatar} />
                                    </span>
                                    登录以发表评论
                                </header>
                            </div>
                        );
                    }
                })(this)}
            </div>
        );
    };

    render() {
        const { store } = this.props;
        const { loading, topic } = store;
        if (loading) {
            return (
                <div className={styles.topicLoading}>
                    <i className="el-icon-loading" />
                </div>
            );
        }
        const meta = {
            title: `${topic.title}-Elune Forum-Web development community,WordPress,PHP,Java,JavaScript`,
            description: topic.content.substr(0, 100).replace(/\s/g, ""),
            // canonical: "https://elune.me",
            meta: {
                charset: "utf-8",
                name: {
                    keywords: topic.tags.map(tag => tag.title).join(",")
                }
            }
        };

        return (
            <main className={styles.mainView}>
                <DocumentMeta {...meta} />
                <div className={styles.mainWrapper}>
                    {this.renderMainThread()}
                    {this.renderPostList()}
                    {this.renderPostBox()}
                </div>
            </main>
        );
    }
}
