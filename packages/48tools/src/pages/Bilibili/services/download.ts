import { promisify } from 'util';
import { pipeline } from 'stream';
import * as fs from 'fs';
import got, { Response } from 'got';
import type { VideoInfo, AudioInfo, ProgressEventData } from '../types';

const pipelineP: (stream1: NodeJS.ReadableStream, stream2: NodeJS.WritableStream) => Promise<void> = promisify(pipeline);

const USER_AGENT: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/84.0.4147.38 Safari/537.36 Edg/84.0.522.15';

// 请求bilibili的html
export async function requestBilibiliHtml(url: string): Promise<string> {
  const res: Response<string> = await got.get(url, {
    responseType: 'text',
    headers: {
      Host: 'www.bilibili.com',
      'User-Agent': USER_AGENT
    }
  });

  return res.body;
}

/**
 * 请求视频信息
 * @param { string } payload: 查询参数
 * @param { string } sign: 加密后的sign
 */
export async function requestVideoInfo(payload: string, sign: string): Promise<VideoInfo> {
  const res: Response<VideoInfo> = await got.get(`https://interface.bilibili.com/v2/playurl?${ payload }&sign=${ sign }`, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 请求音频信息
 * @param { string } auid: 音频id
 */
export async function requestAudioInfo(auid: string): Promise<AudioInfo> {
  const res: Response<AudioInfo> = await got.get(`https://www.bilibili.com/audio/music-service-c/web/url?sid=${ auid }&privilege=2&quality=2`, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { string } filename: 文件本地地址
 * @param { (e: ProgressEventData) => void } onProgress: 进度条
 */
export async function requestDownloadFileByStream(fileUrl: string, filename: string, onProgress: (e: ProgressEventData) => void): Promise<void> {
  await pipelineP(
    got.stream(fileUrl, {
      headers: {
        referer: 'https://www.bilibili.com/'
      }
    }).on('downloadProgress', onProgress),
    fs.createWriteStream(filename)
  );
}