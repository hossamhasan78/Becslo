import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer'
import { CalculationInput } from '@/lib/pricing-engine'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 10,
    marginBottom: 4
  },
  total: {
    fontSize: 18,
    marginTop: 30,
    fontWeight: 'bold'
  }
})

interface PDFProps {
  input: CalculationInput
  result: {
    totalHours: number
    baseRate: number
    experienceMultiplier: number
    geoMultiplier: number
    adjustedHourlyRate: number
    baseCost: number
    overhead: number
    riskBuffer: number
    profitMargin: number
    finalPrice: number
  }
}

export function QuotePDF({ input, result }: PDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Project Quote</Text>
        
        <Text style={styles.sectionTitle}>Project Details</Text>
        <Text style={styles.text}>Pricing Model: {input.pricingModel}</Text>
        <Text style={styles.text}>Designer Experience: {input.experienceYears} years</Text>
        <Text style={styles.text}>Freelance Experience: {input.freelanceYears} years</Text>
        <Text style={styles.text}>Designer Country: {input.designerCountry}</Text>
        <Text style={styles.text}>Client Country: {input.clientCountry}</Text>
        
        <Text style={{ ...styles.text, marginTop: 20 }}>Services:</Text>
        {input.services.map((service, index) => (
          <Text key={index} style={styles.text}>• {service.hours} hours</Text>
        ))}
        <Text style={styles.text}>Total Hours: {result.totalHours}</Text>
        
        {input.costs.length > 0 && (
          <>
            <Text style={{ ...styles.sectionTitle, marginTop: 20 }}>Costs</Text>
            {input.costs.map((cost, index) => (
              <Text key={index} style={styles.text}>• {cost.name}: ${cost.amount} ({cost.type})</Text>
            ))}
          </>
        )}
        
        <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
        <Text style={styles.text}>Base Rate: ${result.baseRate}/hour</Text>
        <Text style={styles.text}>Experience Multiplier: {result.experienceMultiplier.toFixed(2)}x</Text>
        <Text style={styles.text}>Geography Multiplier: {result.geoMultiplier.toFixed(2)}x</Text>
        <Text style={styles.text}>Adjusted Hourly Rate: ${result.adjustedHourlyRate.toFixed(2)}</Text>
        <Text style={styles.text}>Base Cost: ${result.baseCost.toFixed(2)}</Text>
        <Text style={styles.text}>Overhead: ${result.overhead.toFixed(2)}</Text>
        <Text style={styles.text}>Risk Buffer: ${result.riskBuffer.toFixed(2)}</Text>
        <Text style={styles.text}>Profit Margin: ${result.profitMargin.toFixed(2)}</Text>
        
        <Text style={styles.total}>Final Price: ${result.finalPrice}</Text>
      </Page>
    </Document>
  )
}
