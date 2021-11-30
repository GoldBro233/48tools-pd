import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Button, Modal, Input, Form, Table, Spin, message, type FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import style from './addBySearch.sass';
import { requestSpaceArcSearch } from '../../services/download';
import { parseVideoList, parseVideoUrl } from '../parseBilibiliUrl';
import { setAddDownloadList } from '../../reducers/download';
import type { SpaceArcSearchVListItem, SpaceArcSearch } from '../../services/interface';

interface PageQuery {
  id: string | undefined;
  current: number;
}

interface DownloadItem {
  cid: number;
  part: string;
  bvid: string;
  index: number;
}

/* 根据账号ID搜索 */
function AddBySearch(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(true);
  const [pageQuery, setPageQuery]: [PageQuery, D<S<PageQuery>>] = useState({
    current: 1,
    id: undefined
  });
  const [dataSource, setDataSource]: [SpaceArcSearchVListItem[], D<S<SpaceArcSearchVListItem[]>>] = useState([]); // 所有视频
  const [bvVideoList, setBvVideoList]: [DownloadItem[], D<S<DownloadItem[]>>] = useState([]); // 单个视频的part
  const [total, setTotal]: [number, D<S<number>>] = useState(0);                              // 视频总数
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);                    // 加载动画
  const [secondLoading, setSecondLoading]: [boolean, D<S<boolean>>] = useState(false);        // 单个视频搜索的part

  // 添加到下载列表
  async function handleAddDownloadQueueClick(o: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const bvId: string = o.bvid.replace(/^bv/i, '');
      const result: string | void = await parseVideoUrl('bv', bvId, o.index);

      if (result) {
        dispatch(setAddDownloadList({
          qid: randomUUID(),
          durl: result,
          type: 'bv',
          id: bvId,
          page: o.index
        }));
        message.success('添加到下载队列！');
      } else {
        message.warn('没有获取到媒体地址！');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 获取数据
  async function getData(): Promise<void> {
    if (!pageQuery.id) return;

    setLoading(true);

    try {
      const res: SpaceArcSearch = await requestSpaceArcSearch(pageQuery.id, pageQuery.current);

      setDataSource(res.data.list.vlist ?? res.data.list.vList);
      setTotal(res.data.page.count);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // 解析地址
  async function handleGetUrlListClick(record: SpaceArcSearchVListItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setSecondLoading(true);

    try {
      const videoList: Array<{ cid: number; part: string }> | void = await parseVideoList(record.bvid);

      setBvVideoList(
        (videoList ?? []).map((o: { cid: number; part: string }, i: number): DownloadItem =>
          Object.assign(o, {
            bvid: record.bvid,
            index: i + 1
          }))
      );
    } catch (err) {
      console.error(err);
    }

    setSecondLoading(false);
  }

  // 修改页码
  function handlePageChange(page: number, pageSize: number): void {
    setPageQuery((prevState: PageQuery): PageQuery => ({
      ...prevState,
      current: page
    }));
  }

  // 提交和搜索
  function handleSearchSubmit(value: { spaceId: string | undefined }): void {
    if (value.spaceId) {
      setPageQuery({
        current: 1,
        id: value.spaceId
      });
    }
  }

  // 关闭
  function handleCancelClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  // 渲染下载列表
  function videoListDownloadRender(): Array<ReactNode> {
    return bvVideoList.map((o: DownloadItem, index: number): ReactElement => {
      return (
        <Button key={ o.cid }
          className={ style.downloadBtn }
          block={ true }
          onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleAddDownloadQueueClick(o, event) }
        >
          { index + 1 }、
          { o.part }
        </Button>
      );
    });
  }

  const columns: ColumnsType<SpaceArcSearchVListItem> = [
    {
      title: '标题',
      dataIndex: 'title'
    },
    {
      title: '操作',
      key: 'handle',
      width: 120,
      render: (value: undefined, record: SpaceArcSearchVListItem, index: number): ReactElement => {
        return (
          <Button size="small"
            onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleGetUrlListClick(record, event) }
          >
            查看视频
          </Button>
        );
      }
    }
  ];

  useEffect(function(): void {
    getData();
  }, [pageQuery]);

  return (
    <Fragment>
      <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => setVisible(true) }>个人主页批量下载</Button>
      <Modal title="个人主页批量下载"
        visible={ visible }
        width={ 800 }
        centered={ true }
        destroyOnClose={ true }
        maskClosable={ false }
        footer={ <Button onClick={ handleCancelClick }>关闭</Button> }
        onCancel={ handleCancelClick }
      >
        <div className={ style.content }>
          <Form className={ style.form } form={ form } layout="inline" onFinish={ handleSearchSubmit }>
            <Form.Item name="spaceId">
              <Input className={ style.spaceIdInput } placeholder="账号ID" />
            </Form.Item>
            <Button htmlType="submit">搜索</Button>
          </Form>
          <div className={ style.resultContent }>
            <div className={ style.resultContentItem }>
              <Table className={ style.table }
                size="small"
                columns={ columns }
                dataSource={ dataSource }
                loading={ loading }
                rowKey="bvid"
                scroll={{ y: 275 }}
                pagination={{
                  current: pageQuery.current,
                  pageSize: 30,
                  showQuickJumper: true,
                  showSizeChanger: false,
                  total,
                  onChange: handlePageChange
                }}
              />
            </div>
            <div className={ classNames(style.resultContentItem, style.downloadContent) }>
              {
                secondLoading ? (
                  <div className={ style.center }>
                    <Spin size="large" tip="解析中..." />
                  </div>
                ) : videoListDownloadRender()
              }
            </div>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}

export default AddBySearch;