import { ipcRenderer } from 'electron';
import type { ReactElement, ReactNode, MouseEvent } from 'react';
import { Avatar, Button, Tag } from 'antd';
import { ToolTwoTone as IconToolTwoTone } from '@ant-design/icons';
import { source } from '../../../utils/utils';
import type { Search } from '../PlayerWindow';
import type { LiveRoomInfo } from '../../48/services/interface';

interface LiveInfoProps {
  search: Search;
  info: LiveRoomInfo | undefined;
}

/* 显示直播信息 */
function LiveInfo(props: LiveInfoProps): ReactElement {
  const { search, info }: LiveInfoProps = props;

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('player-developer-tools', search.id);
  }

  // 渲染小偶像信息
  function infoRender(): Array<ReactNode> | null {
    if (!info) return null;

    const { content }: LiveRoomInfo = info;

    return [
      <Avatar key="avatar" src={ source(content.user.userAvatar) } />,
      <span key="username" className="ml-[6px] text-[12px]">
        { content.user.userName }
      </span>
    ];
  }

  return (
    <header className="shrink-0 mb-[8px]">
      <h1 className="inline-block mb-[8px] mr-[6px] text-[16px]">
        { search.title }
      </h1>
      { search.liveType === 2 ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag> }
      <div className="flex">
        <div className="grow">{ infoRender() }</div>
        <div className="shrink-0">
          <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
        </div>
      </div>
    </header>
  );
}

export default LiveInfo;