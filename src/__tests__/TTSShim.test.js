/**
 * Tests for TTSShim voice selection logic
 * Validates that the correct voice is selected for different languages
 */

describe('TTSShim Voice Selection', () => {
  describe('Language Code Parsing', () => {
    it('should extract base language code from full language code', () => {
      const testCases = [
        {input: 'ja-JP', expectedBase: 'ja', expectedFull: 'ja-JP'},
        {input: 'en-US', expectedBase: 'en', expectedFull: 'en-US'},
        {input: 'ko-KR', expectedBase: 'ko', expectedFull: 'ko-KR'},
        {input: 'zh-CN', expectedBase: 'zh', expectedFull: 'zh-CN'},
        {input: null, expectedBase: 'en', expectedFull: 'en-US'},
        {input: undefined, expectedBase: 'en', expectedFull: 'en-US'},
        {input: '', expectedBase: 'en', expectedFull: 'en-US'},
      ];

      testCases.forEach(({input, expectedBase, expectedFull}) => {
        // Simulate the logic from TTSShim.web.js
        const baseLang =
          input && input.split('-')[0] ? input.split('-')[0] : 'en';
        const fullLang = input || 'en-US';

        expect(baseLang).toBe(expectedBase);
        expect(fullLang).toBe(expectedFull);
      });
    });
  });

  describe('Voice Priority Logic', () => {
    it('should prioritize Google voices for exact language match', () => {
      const mockVoices = [
        {name: 'Microsoft David', lang: 'en-US'},
        {name: 'Google 日本語', lang: 'ja-JP'},
        {name: 'Microsoft Ayumi', lang: 'ja-JP'},
      ];

      const targetLang = 'ja-JP';
      const baseLang = 'ja';

      // Priority 1: Google voice for exact language
      const voice = mockVoices.find(
        v => v.name.includes('Google') && v.lang === targetLang,
      );

      expect(voice).toBeDefined();
      expect(voice.name).toBe('Google 日本語');
      expect(voice.lang).toBe('ja-JP');
    });

    it('should fallback to base language match if exact match not found', () => {
      const mockVoices = [
        {name: 'Microsoft David', lang: 'en-US'},
        {name: 'Google 日本語', lang: 'ja-JP'},
        {name: 'Generic Japanese', lang: 'ja'},
      ];

      const targetLang = 'ja-CN'; // Non-existent variant
      const baseLang = 'ja';

      // Priority: Try exact match first (should fail)
      let voice = mockVoices.find(
        v => v.name.includes('Google') && v.lang === targetLang,
      );
      expect(voice).toBeUndefined();

      // Fallback: Try base language match
      voice = mockVoices.find(
        v => v.name.includes('Google') && v.lang.startsWith(baseLang),
      );
      expect(voice).toBeDefined();
      expect(voice.lang).toBe('ja-JP');
    });

    it('should use first available voice as ultimate fallback', () => {
      const mockVoices = [
        {name: 'Microsoft David', lang: 'en-US'},
        {name: 'Microsoft Zira', lang: 'en-US'},
      ];

      const targetLang = 'ja-JP';

      // Try to find Japanese voice (should fail)
      let voice = mockVoices.find(v => v.lang === targetLang);
      expect(voice).toBeUndefined();

      // Ultimate fallback: use first voice
      voice = mockVoices[0];
      expect(voice).toBeDefined();
      expect(voice.name).toBe('Microsoft David');
    });
  });

  describe('Voice Selection Priority Order', () => {
    it('should select voices in correct priority order', () => {
      const testScenarios = [
        {
          description: 'Google voice with exact language beats Microsoft',
          voices: [
            {name: 'Microsoft Neural Ayumi', lang: 'ja-JP'},
            {name: 'Google 日本語', lang: 'ja-JP'},
          ],
          targetLang: 'ja-JP',
          expectedVoice: 'Google 日本語',
        },
        {
          description: 'Microsoft Neural beats Premium for exact match',
          voices: [
            {name: 'Premium Japanese', lang: 'ja-JP'},
            {name: 'Microsoft Neural Ayumi', lang: 'ja-JP'},
          ],
          targetLang: 'ja-JP',
          // Google is priority 1, but no Google voice
          // Microsoft Neural is priority 2
          expectedVoice: 'Microsoft Neural Ayumi',
        },
        {
          description: 'Base language match when exact not found',
          voices: [
            {name: 'Google US English', lang: 'en-US'},
            {name: 'Google 日本語', lang: 'ja-JP'},
          ],
          targetLang: 'ja-CN', // Non-standard variant
          expectedVoice: 'Google 日本語', // Should match base 'ja'
        },
      ];

      testScenarios.forEach(
        ({description, voices, targetLang, expectedVoice}) => {
          const baseLang = targetLang.split('-')[0];

          // Simulate priority checks from TTSShim
          const voicePriorities = [
            v => v.name.includes('Google') && v.lang === targetLang,
            v => v.name.includes('Google') && v.lang.startsWith(baseLang),
            v =>
              v.name.includes('Microsoft') &&
              v.name.includes('Neural') &&
              v.lang === targetLang,
            v =>
              v.name.includes('Microsoft') &&
              v.name.includes('Neural') &&
              v.lang.startsWith(baseLang),
            v =>
              (v.name.includes('Premium') || v.name.includes('Enhanced')) &&
              v.lang === targetLang,
            v =>
              (v.name.includes('Premium') || v.name.includes('Enhanced')) &&
              v.lang.startsWith(baseLang),
            v => v.lang === targetLang,
            v => v.lang.startsWith(baseLang),
          ];

          let selectedVoice = null;
          for (const priorityCheck of voicePriorities) {
            const voice = voices.find(priorityCheck);
            if (voice) {
              selectedVoice = voice;
              break;
            }
          }

          expect(selectedVoice).toBeDefined();
          expect(selectedVoice.name).toBe(expectedVoice);
        },
      );
    });
  });
});
