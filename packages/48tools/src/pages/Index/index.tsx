import { ipcRenderer, shell } from 'electron';
import { useContext, ReactElement, ReactNodeArray, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import { ToolTwoTone as IconToolTwoTone, BugTwoTone as IconBugTwoTone } from '@ant-design/icons';
import style from './index.sass';
import FFmpegOption from './FFmpegOption';
import ThemeContext, { Theme } from '../../components/Theme/ThemeContext';

interface NativeItem {
  name: string;
  url: string;
}

/* 导航配置 */
const navLinkConfig: Array<Array<NativeItem>> = [
  [
    { name: '口袋48直播抓取', url: '/48/Pocket48Live' },
    { name: '口袋48录播下载', url: '/48/Pocket48Record' },
    { name: '官方公演直播抓取', url: '/48/InLive' },
    { name: '官方公演录播下载', url: '/48/InVideo' }
  ],
  [
    { name: 'B站视频下载', url: '/Bilibili/Download' },
    { name: 'B站直播抓取', url: '/Bilibili/Live' }
  ],
  [
    { name: '视频裁剪', url: '/VideoEdit/VideoCut' },
    { name: '视频合并', url: '/VideoEdit/Concat' }
  ]
];

/* 导航渲染 */
function nativeRender(): ReactNodeArray {
  const element: ReactNodeArray = [];

  for (let i: number = 0, j: number = navLinkConfig.length; i < j; i++) {
    const group: Array<NativeItem> = navLinkConfig[i];
    const groupElement: ReactNodeArray = [];

    for (const navItem of group) {
      groupElement.push(
        <Link key={ navItem.name } className={ style.navItemLink } to={ navItem.url }>
          <Button>{ navItem.name }</Button>
        </Link>
      );
    }

    element.push(
      <nav key={ `nav-${ i }` }>
        <Space size={ 16 }>{ groupElement }</Space>
      </nav>,
      <Divider key={ `divider-${ i }` } />
    );
  }

  return element;
}

/* 首页 */
function Index(props: {}): ReactElement {
  const theme: Theme = useContext(ThemeContext);

  // 打开issues
  function handleOpenIssuesClick(event: MouseEvent<HTMLButtonElement>): void {
    shell.openExternal('https://github.com/duan602728596/48tools/issues');
  }

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent<HTMLButtonElement>): void {
    ipcRenderer.send('developer-tools');
  }

  return (
    <div className={ style.main }>
      { nativeRender() }
      <div>
        <Space size={ 16 }>
          <FFmpegOption />
          { theme.ChangeThemeElement }
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
          <Tooltip title="问题反馈">
            <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
          </Tooltip>
        </Space>
      </div>
      <Divider />
      {/* 二维码 */}
      <p>欢迎打赏：</p>
      <Space>
        <Image className={ style.dashangImage } src={ require('./images/zfb.avif').default } />
        <Image className={ style.dashangImage } src={ require('./images/wx.avif').default } />
      </Space>
    </div>
  );
}

export default Index;