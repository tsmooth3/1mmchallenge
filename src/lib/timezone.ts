/**
 * Utility functions for handling Eastern Time (ET) timezone
 * Eastern Time is UTC-5 (EST) or UTC-4 (EDT)
 */

/**
 * Get current date in Eastern Time as YYYY-MM-DD
 */
export function getEasternDate(): string {
	const now = new Date();
	return formatEasternDate(now);
}

/**
 * Format a date to Eastern Time as YYYY-MM-DD
 */
export function formatEasternDate(date: Date): string {
	const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
	const year = easternDate.getFullYear();
	const month = String(easternDate.getMonth() + 1).padStart(2, '0');
	const day = String(easternDate.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Get current time in Eastern Time as HH:MM
 */
export function getEasternTime(): string {
	const now = new Date();
	return formatEasternTime(now);
}

/**
 * Format a date to Eastern Time as HH:MM
 */
export function formatEasternTime(date: Date): string {
	const easternTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
	const hours = String(easternTime.getHours()).padStart(2, '0');
	const minutes = String(easternTime.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Convert a date string (YYYY-MM-DD) and time string (HH:MM) to a datetime string in Eastern Time
 * Returns ISO string for storage
 * 
 * This function treats the input date/time as Eastern Time and converts it to UTC for storage
 */
export function combineEasternDateTime(dateStr: string, timeStr: string): string {
	// Parse the date and time components  
	const [year, month, day] = dateStr.split('-').map(Number);
	const [hours, minutes] = timeStr.split(':').map(Number);
	
	// Create a date string representing Eastern time
	const dateTimeStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
	
	// Create a date object for this specific date/time to determine DST
	const testDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`);
	
	// Get what 12:00 UTC is in Eastern for this date
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		hour: '2-digit',
		hour12: false
	});
	
	const easternHour = parseInt(formatter.format(testDate));
	const offsetHours = easternHour - 12; // Difference from UTC
	
	// Create the UTC date: if Eastern time is X, UTC time is X + offset
	// But we want the reverse: if we have Eastern time X, what UTC time gives us that?
	// Answer: UTC time = Eastern time - offset
	const baseDate = new Date(`${dateTimeStr}Z`);
	const result = new Date(baseDate.getTime() - offsetHours * 60 * 60 * 1000);
	
	return result.toISOString();
}

/**
 * Format a datetime string to Eastern Time for display
 */
export function formatEasternDateTime(isoString: string): { date: string; time: string } {
	const date = new Date(isoString);
	const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
	
	const year = easternDate.getFullYear();
	const month = String(easternDate.getMonth() + 1).padStart(2, '0');
	const day = String(easternDate.getDate()).padStart(2, '0');
	const hours = String(easternDate.getHours()).padStart(2, '0');
	const minutes = String(easternDate.getMinutes()).padStart(2, '0');
	
	return {
		date: `${year}-${month}-${day}`,
		time: `${hours}:${minutes}`
	};
}

