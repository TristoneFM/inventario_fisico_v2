// Sound utility functions
export const playSound = (type) => {
  try {
    if (typeof window !== 'undefined') {
      if (type === 'success') {
        // Call the global soundOk function from public/sounds.js
        if (window.soundOk) {
          window.soundOk();
        }
      } else if (type === 'error') {
        // Call the global soundWrong function from public/sounds.js
        if (window.soundWrong) {
          window.soundWrong();
        }
      }
    }
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
}; 