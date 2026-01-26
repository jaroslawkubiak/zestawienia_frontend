import { Pipe, PipeTransform } from '@angular/core';
import emojiList from './emojiList.json';
@Pipe({
  name: 'emojiConvert',
  standalone: true,
})
export class EmojiConvertPipe implements PipeTransform {
  private emojiMap: { [key: string]: string } = emojiList;
  transform(text: string): string {
    if (!text) return '';

    // extract http links
    const urlRegex = /https?:\/\/[^\s]+/gi;
    const urls: string[] = [];
    const textWithoutUrls = text.replace(urlRegex, (match) => {
      urls.push(match);
      return `__URL_PLACEHOLDER_${urls.length - 1}__`;
    });

    // replace text to emoji
    let replaced = textWithoutUrls;
    for (const key in this.emojiMap) {
      const regex = new RegExp(this.escapeRegExp(key), 'g');
      replaced = replaced.replace(regex, this.emojiMap[key]);
    }

    // put links back
    urls.forEach((url, idx) => {
      replaced = replaced.replace(`__URL_PLACEHOLDER_${idx}__`, url);
    });

    return replaced;
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
