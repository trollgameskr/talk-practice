/**
 * 히스토리 라우터 유틸리티
 * 브라우저 히스토리 API를 사용한 클라이언트 사이드 라우팅 지원
 */

import {Platform} from 'react-native';

// Build-time constants
declare const __BASE_PATH__: string;

// Web environment types
interface PopStateEvent extends Event {
  state: any;
}

declare const window: {
  location: {
    pathname: string;
    search: string;
    href: string;
  };
  history: {
    pushState(state: any, title: string, url?: string): void;
    replaceState(state: any, title: string, url?: string): void;
  };
  addEventListener(type: string, listener: (event: PopStateEvent) => void): void;
  removeEventListener(type: string, listener: (event: PopStateEvent) => void): void;
};

export interface RouteConfig {
  path: string;
  screen: string;
  params?: Record<string, any>;
}

/**
 * React Navigation linking configuration
 * URL 경로를 React Navigation 화면과 매핑
 */
export const linkingConfig = {
  prefixes: [
    ...(typeof __BASE_PATH__ !== 'undefined' && __BASE_PATH__
      ? [`https://trollgameskr.github.io${__BASE_PATH__}`]
      : []),
    'http://localhost:3000',
    'gemini-talk://',
  ],
  config: {
    screens: {
      Login: 'login',
      Home: '',
      TopicSelection: 'topics',
      Conversation: {
        path: 'conversation/:topic?',
        parse: {
          topic: (topic: string) => topic,
        },
      },
      Progress: 'progress',
      Settings: 'settings',
      AppearanceSettings: 'settings/appearance',
      LanguageSettings: 'settings/language',
      AllSettings: 'settings/:category',
      Feedback: 'feedback/:sessionId?',
    },
  },
};

/**
 * 웹 환경에서 브라우저 히스토리 상태를 관리하는 클래스
 */
class HistoryManager {
  private isWeb: boolean;
  private basePath: string;

  constructor() {
    this.isWeb = Platform.OS === 'web';
    // GitHub Pages 배포 환경에서는 빌드 시 주입된 BASE_PATH 사용
    this.basePath = '';
    
    if (this.isWeb) {
      try {
        // 빌드 시 webpack DefinePlugin으로 주입된 BASE_PATH 사용
        this.basePath = typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '';
      } catch (e) {
        // __BASE_PATH__가 정의되지 않은 경우 (개발 환경) 빈 문자열 사용
        this.basePath = '';
      }
    }
  }

  /**
   * 현재 환경이 웹인지 확인
   */
  get isWebPlatform(): boolean {
    return this.isWeb;
  }

  /**
   * 기본 경로 반환
   */
  get basePathname(): string {
    return this.basePath;
  }

  /**
   * 새 히스토리 엔트리 추가
   */
  pushState(state: any, title: string, url?: string): void {
    if (!this.isWeb || typeof window === 'undefined' || !window.history) {
      return;
    }

    try {
      const fullUrl = url ? this.basePath + url : undefined;
      window.history.pushState(state, title, fullUrl);
    } catch (error) {
      console.warn('Failed to push history state:', error);
    }
  }

  /**
   * 현재 히스토리 엔트리 업데이트
   */
  replaceState(state: any, title: string, url?: string): void {
    if (!this.isWeb || typeof window === 'undefined' || !window.history) {
      return;
    }

    try {
      const fullUrl = url ? this.basePath + url : undefined;
      window.history.replaceState(state, title, fullUrl);
    } catch (error) {
      console.warn('Failed to replace history state:', error);
    }
  }

  /**
   * popstate 이벤트 리스너 등록
   */
  addEventListener(
    handler: (event: PopStateEvent) => void,
  ): (() => void) | undefined {
    if (!this.isWeb || typeof window === 'undefined' || !window.addEventListener) {
      return undefined;
    }

    try {
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    } catch (e) {
      return undefined;
    }
  }

  /**
   * 현재 경로에서 basePath를 제거한 순수 경로 반환
   */
  getCurrentPath(): string {
    if (!this.isWeb || typeof window === 'undefined' || !window.location) {
      return '/';
    }

    try {
      const pathname = window.location.pathname;
      if (this.basePath && pathname.startsWith(this.basePath)) {
        return pathname.slice(this.basePath.length) || '/';
      }
      return pathname;
    } catch (e) {
      return '/';
    }
  }

  /**
   * 전체 URL 반환 (쿼리 파라미터 포함)
   */
  getFullUrl(): string {
    if (!this.isWeb || typeof window === 'undefined' || !window.location) {
      return '/';
    }

    try {
      return window.location.pathname + window.location.search;
    } catch (e) {
      return '/';
    }
  }
}

// 싱글톤 인스턴스
export const historyManager = new HistoryManager();

/**
 * 초기 URL 상태 가져오기
 * 앱 시작 시 URL을 파싱하여 초기 화면 결정
 */
export const getInitialURL = async (): Promise<string | null> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    try {
      return window.location.href;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export default historyManager;
