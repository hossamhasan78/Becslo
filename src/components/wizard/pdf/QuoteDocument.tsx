import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFQuoteData } from '@/types/pdf';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 48,
  },
  header: {
    marginBottom: 30,
  },
  brand: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 8,
    color: '#1E293B',
  },
  documentTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 600,
  },
  metaValue: {
    fontSize: 11,
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: '#1E293B',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colName: {
    flex: 3,
    fontSize: 11,
    color: '#1E293B',
  },
  colHours: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  colRate: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  colCost: {
    flex: 1,
    fontSize: 11,
    color: '#1E293B',
    fontWeight: 600,
    textAlign: 'right',
  },
  overheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  overheadName: {
    fontSize: 11,
    color: '#64748B',
  },
  overheadValue: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: 600,
  },
  summarySection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#1E293B',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1E293B',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#1E293B',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1E293B',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1E293B',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#94A3B8',
  },
});

export interface QuoteDocumentProps {
  data: PDFQuoteData;
}

export const QuoteDocument: React.FC<QuoteDocumentProps> = ({ data }) => {
  const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subtotal = data.services.reduce((sum, s) => sum + s.totalCost, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Becslo</Text>
          <Text style={styles.documentTitle}>Quote</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{data.user.name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{data.user.email}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Calculation ID</Text>
            <Text style={styles.metaValue}>{data.calculationId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Pricing Model</Text>
            <Text style={styles.metaValue}>{data.pricingModel === 'hourly' ? 'Hourly' : 'Project-based'}</Text>
          </View>
        </View>

        {data.services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Service Breakdown</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colName}>Service</Text>
                <Text style={styles.colHours}>Hours</Text>
                <Text style={styles.colRate}>Rate</Text>
                <Text style={styles.colCost}>Cost</Text>
              </View>
              {data.services.map((service, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.colName}>{service.name}</Text>
                  <Text style={styles.colHours}>{service.hours}</Text>
                  <Text style={styles.colRate}>${service.rate}/hr</Text>
                  <Text style={styles.colCost}>${service.totalCost.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {data.overheadCosts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Overhead Costs</Text>
            {data.overheadCosts.map((overhead, index) => (
              <View key={index} style={styles.overheadRow}>
                <Text style={styles.overheadName}>{overhead.name}</Text>
                <Text style={styles.overheadValue}>${overhead.value.toFixed(0)}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Designer Level</Text>
            <Text style={styles.summaryValue}>{data.experienceMultiplier.designer}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Freelance Level</Text>
            <Text style={styles.summaryValue}>{data.experienceMultiplier.freelance}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Designer Location</Text>
            <Text style={styles.summaryValue}>{data.geographyMultiplier.designerCountry}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Client Location</Text>
            <Text style={styles.summaryValue}>{data.geographyMultiplier.clientCountry}</Text>
          </View>
          
          {subtotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(0)}</Text>
            </View>
          )}

          {data.recommendedRange && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recommended Range</Text>
              <Text style={styles.summaryValue}>
                ${data.recommendedRange.min.toFixed(0)} - ${data.recommendedRange.max.toFixed(0)}
              </Text>
            </View>
          )}

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Price</Text>
            <Text style={styles.summaryTotalValue}>${data.finalPrice.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ID: {data.calculationId}</Text>
          <Text style={styles.footerText}>Generated on {formattedDate}</Text>
          <Text style={styles.footerText}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};
