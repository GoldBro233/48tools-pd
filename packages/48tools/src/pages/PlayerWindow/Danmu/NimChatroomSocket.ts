import { randomUUID } from 'node:crypto';
import NIM_SDK from 'SDK';
import appKey from './sdk/appKey.mjs';
import type { LiveRoomMessage } from './messageType';

const { Chatroom }: any = NIM_SDK;

type OnMessage = (t: NimChatroomSocket, event: Array<LiveRoomMessage>) => void | Promise<void>;

interface NimChatroomSocketArgs {
  roomId: string;
  onMessage: OnMessage;
}

interface NIMError {
  code: number | string;
  message: string;
}

/* 创建网易云信sdk的socket连接 */
class NimChatroomSocket {
  public roomId: string;
  public nimChatroomSocket: any; // 口袋48
  public onMessage: OnMessage;

  constructor(arg: NimChatroomSocketArgs) {
    this.roomId = arg.roomId; // 房间id
    this.onMessage = arg.onMessage;
  }

  // 初始化
  init(): void {
    this.nimChatroomSocket = Chatroom.getInstance({
      appKey: atob(appKey),
      chatroomId: this.roomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect(event: any): void {
        console.log('进入聊天室', event);
      },
      onmsgs: this.handleRoomSocketMessage,
      onerror: this.handleRoomSocketError,
      ondisconnect: this.handleRoomSocketDisconnect,
      isAnonymous: true,
      chatroomNick: randomUUID(),
      chatroomAvatar: ''
    });
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<LiveRoomMessage>): void => {
    this.onMessage(this, event);
  };

  // 进入房间失败
  handleRoomSocketError: Function = (err: NIMError, event: any): void => {
    console.log('发生错误', err, event);
  };

  // 断开连接
  handleRoomSocketDisconnect: Function = (err: NIMError): void => {
    console.log('连接断开', err);
  };

  // 断开连接
  disconnect(): void {
    this.nimChatroomSocket.disconnect();
    this.nimChatroomSocket = undefined;
  }
}

export default NimChatroomSocket;