import { Injectable } from '@angular/core';
import { SoundType } from './types/SoundType';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  playSound(soundType: SoundType) {
    const audio = new Audio(`assets/audio/${soundType}`);
    // audio.play();
  }
}
