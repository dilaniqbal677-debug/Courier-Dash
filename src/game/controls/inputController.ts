/**
 * Input & Movement Controller Engine
 * Handles keyboard (WASD/Arrow/Space), touch swipe gestures, and virtual mobile control signals:
 * - Smooth lane transitions (Lanes 0, 1, 2)
 * - Jump physics & aerial fast-dive / ground slide mechanics
 * - Blaster shooting trigger for boss encounters
 * - Clean event listener lifecycle management
 */

import { LANES, LaneIndex, JUMP_VELOCITY } from '../constants';
import { sounds } from '../../audio/soundManager';

export interface RunnerState {
  currentLane: LaneIndex;
  targetLaneX: number;
  currentX: number;
  currentY: number;
  velY: number;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  distance: number;
  isDead: boolean;
  blasterAmmo: number;
  shakeIntensity: number;
}

export interface InputControllerCallbacks {
  isPlaying: () => boolean;
  isPaused: () => boolean;
  onShoot?: () => void;
}

export class InputController {
  private state: RunnerState;
  private callbacks: InputControllerCallbacks;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private minSwipeDistance = 30; // pixels
  private maxSwipeDuration = 500; // ms
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private activeContainer: HTMLElement | null = null;

  constructor(state: RunnerState, callbacks: InputControllerCallbacks) {
    this.state = state;
    this.callbacks = callbacks;

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  public attach(container: HTMLElement) {
    this.detach();
    this.activeContainer = container;

    window.addEventListener('keydown', this.boundKeyDown);
    container.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    container.addEventListener('touchend', this.boundTouchEnd, { passive: true });
  }

  public detach() {
    window.removeEventListener('keydown', this.boundKeyDown);
    if (this.activeContainer) {
      this.activeContainer.removeEventListener('touchstart', this.boundTouchStart);
      this.activeContainer.removeEventListener('touchend', this.boundTouchEnd);
      this.activeContainer = null;
    }
  }

  public moveLeft() {
    if (this.isBlocked()) return;
    if (this.state.currentLane > 0) {
      this.state.currentLane = (this.state.currentLane - 1) as LaneIndex;
      this.state.targetLaneX = LANES[this.state.currentLane];
      sounds.playSlide();
    }
  }

  public moveRight() {
    if (this.isBlocked()) return;
    if (this.state.currentLane < 2) {
      this.state.currentLane = (this.state.currentLane + 1) as LaneIndex;
      this.state.targetLaneX = LANES[this.state.currentLane];
      sounds.playSlide();
    }
  }

  public jump() {
    if (this.isBlocked()) return;
    if (!this.state.isJumping) {
      this.state.isJumping = true;
      this.state.velY = JUMP_VELOCITY;
      this.state.isSliding = false;
      this.state.slideTimer = 0;
      sounds.playJump();
    }
  }

  public slide() {
    if (this.isBlocked()) return;
    // Downwards fast-dive if in air, or slide along ground
    if (this.state.isJumping) {
      this.state.velY = -22; // Fast dive
      this.state.shakeIntensity = 0.05;
    }
    this.state.isSliding = true;
    this.state.slideTimer = 0.65;
    sounds.playSlide();
  }

  public shoot() {
    if (this.isBlocked() || this.state.blasterAmmo <= 0) return;
    this.callbacks.onShoot?.();
  }

  public processSwipeSignal(signal: { direction: 'left' | 'right' | 'up' | 'down' | 'shoot'; timestamp: number } | null) {
    if (!signal) return;
    switch (signal.direction) {
      case 'left':
        this.moveLeft();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'up':
        this.jump();
        break;
      case 'down':
        this.slide();
        break;
      case 'shoot':
        this.shoot();
        break;
    }
  }

  private isBlocked(): boolean {
    return this.state.isDead || !this.callbacks.isPlaying() || this.callbacks.isPaused();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.isBlocked()) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight();
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        e.preventDefault();
        this.jump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        this.slide();
        break;
      case 'KeyF':
      case 'KeyE':
        this.shoot();
        break;
    }
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - this.touchStartX;
    const deltaY = endY - this.touchStartY;
    const elapsed = performance.now() - this.touchStartTime;

    if (elapsed > this.maxSwipeDuration) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < this.minSwipeDistance) {
      // Tap detected (if tap is in top area and has ammo, shoot)
      if (this.state.blasterAmmo > 0 && this.touchStartY < window.innerHeight * 0.6) {
        this.shoot();
      }
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.moveRight();
      } else {
        this.moveLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY < 0) {
        this.jump();
      } else {
        this.slide();
      }
    }
  }

  /**
   * Updates horizontal lane interpolation and vertical gravity physics per frame
   */
  public updatePhysics(delta: number, gravity: number) {
    // 1. Horizontal Smooth Lane Interpolation (crisp and responsive)
    this.state.currentX += (this.state.targetLaneX - this.state.currentX) * Math.min(1.0, 16 * delta);

    // 2. Vertical Jump & Gravity Physics
    if (this.state.isJumping) {
      this.state.velY += gravity * delta;
      this.state.currentY += this.state.velY * delta;

      if (this.state.currentY <= 0) {
        this.state.currentY = 0;
        this.state.velY = 0;
        this.state.isJumping = false;
      }
    }

    // 3. Slide Timer Countdown
    if (this.state.isSliding) {
      this.state.slideTimer -= delta;
      if (this.state.slideTimer <= 0) {
        this.state.isSliding = false;
      }
    }
  }
}
