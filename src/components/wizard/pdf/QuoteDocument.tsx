import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFQuoteData } from '@/types/pdf';

// Base styling for the document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

export interface QuoteDocumentProps {
  data: PDFQuoteData;
}

export const QuoteDocument: React.FC<QuoteDocumentProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Quote for: {data.user.name}</Text>
          <Text>Calculation ID: {data.calculationId}</Text>
        </View>
      </Page>
    </Document>
  );
};
