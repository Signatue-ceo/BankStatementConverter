import { supabase } from '@/lib/supabase';
import { ParsingErrorLog as ParsingErrorLogType } from '@/types';

export type ParsingErrorLog = ParsingErrorLogType;

export async function logParsingError(errorLog: ParsingErrorLog, filename: string = 'unknown', lineNumber: number = 0) {
  try {
    const { data, error } = await supabase
      .from('parsing_errors')
      .insert({
        filename: filename,
        line_number: lineNumber,
        timestamp: errorLog.timestamp,
        error_message: errorLog.error_message,
        stack_trace: errorLog.stack_trace,
        file_size: errorLog.pdf_metadata.file_size,
        original_filename: errorLog.pdf_metadata.original_filename,
        number_of_pages: errorLog.pdf_metadata.number_of_pages,
      });

    if (error) {
      console.error('Error logging parsing error to Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('Parsing error logged to Supabase:', data);
    return { success: true, data };
  } catch (e) {
    console.error('Unexpected error in logParsingError:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
