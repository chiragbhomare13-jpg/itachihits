// seekbar.ts

/**
 * Converts a percentage to a seekbar display
 * @param percentage - Number between 0 and 100
 * @returns Formatted seekbar string
 */
function percentToSeekbar(percentage: number): string {
    const totalWidth = 10;
    const emptyChar = '─';
    const fillChar = '━';
    const sliderChar = '●';
    
    // Ensure percentage is within bounds
    const boundedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Calculate slider position
    const sliderPosition = Math.round((boundedPercentage / 100) * (totalWidth - 1));
    
    let seekbar = '';
    
    // Build the seekbar
    for (let i = 0; i < totalWidth; i++) {
        if (i === sliderPosition) {
            seekbar += sliderChar;
        } else if (i < sliderPosition) {
            seekbar += fillChar;
        } else {
            seekbar += emptyChar;
        }
    }
    
    return seekbar;
}

export { percentToSeekbar };