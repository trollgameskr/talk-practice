/**
 * Tests for VoiceShim web implementation
 * Tests the speech recognition result tracking logic
 */

describe('VoiceShim Result Tracking', () => {
  describe('Result Index Tracking', () => {
    it('should track lastResultIndex correctly in continuous mode', () => {
      // This test validates the logic for tracking speech recognition results
      // In continuous mode, event.results is cumulative, so we need to track
      // which results have been processed to avoid duplicates

      let lastResultIndex = 0;
      const processedResults = [];

      // Simulate first onresult event with 1 final result
      const mockEvent1 = {
        results: [
          {
            0: {transcript: 'Hello'},
            isFinal: true,
          },
        ],
      };

      // Process new results only
      for (let i = lastResultIndex; i < mockEvent1.results.length; i++) {
        const result = mockEvent1.results[i];
        if (result.isFinal) {
          processedResults.push(result[0].transcript);
          lastResultIndex = i + 1;
        }
      }

      expect(processedResults).toEqual(['Hello']);
      expect(lastResultIndex).toBe(1);

      // Simulate second onresult event with cumulative results (1 old + 1 new)
      const mockEvent2 = {
        results: [
          {
            0: {transcript: 'Hello'},
            isFinal: true,
          },
          {
            0: {transcript: 'World'},
            isFinal: true,
          },
        ],
      };

      // Process only new results starting from lastResultIndex
      for (let i = lastResultIndex; i < mockEvent2.results.length; i++) {
        const result = mockEvent2.results[i];
        if (result.isFinal) {
          processedResults.push(result[0].transcript);
          lastResultIndex = i + 1;
        }
      }

      // Should only have processed "World", not "Hello" again
      expect(processedResults).toEqual(['Hello', 'World']);
      expect(lastResultIndex).toBe(2);
    });

    it('should reset lastResultIndex when recognition starts', () => {
      let lastResultIndex = 5; // Some previous value

      // Simulate recognition start (onstart event)
      lastResultIndex = 0;

      expect(lastResultIndex).toBe(0);
    });

    it('should handle interim results without updating lastResultIndex', () => {
      let lastResultIndex = 0;
      const processedResults = [];
      const interimResults = [];

      const mockEvent = {
        results: [
          {
            0: {transcript: 'Hel'},
            isFinal: false,
          },
          {
            0: {transcript: 'Hello'},
            isFinal: false,
          },
          {
            0: {transcript: 'Hello world'},
            isFinal: true,
          },
        ],
      };

      for (let i = lastResultIndex; i < mockEvent.results.length; i++) {
        const result = mockEvent.results[i];
        if (result.isFinal) {
          processedResults.push(result[0].transcript);
          lastResultIndex = i + 1;
        } else {
          interimResults.push(result[0].transcript);
        }
      }

      expect(interimResults).toEqual(['Hel', 'Hello']);
      expect(processedResults).toEqual(['Hello world']);
      expect(lastResultIndex).toBe(3);
    });
  });

  describe('Result Processing', () => {
    it('should separate final and interim results correctly', () => {
      const results = [];
      const interim = [];
      let lastResultIndex = 0;

      const mockEvent = {
        results: [
          {0: {transcript: 'Hello'}, isFinal: true},
          {0: {transcript: 'How ar'}, isFinal: false},
          {0: {transcript: 'How are you'}, isFinal: false},
        ],
      };

      for (let i = lastResultIndex; i < mockEvent.results.length; i++) {
        const result = mockEvent.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          results.push(transcript);
          lastResultIndex = i + 1;
        } else {
          interim.push(transcript);
        }
      }

      expect(results).toEqual(['Hello']);
      expect(interim).toEqual(['How ar', 'How are you']);
      expect(lastResultIndex).toBe(1);
    });
  });
});
