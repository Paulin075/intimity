// Styles premium pour Intimity
import { StyleSheet, Platform } from 'react-native';

export const commonStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    // backgroundColor: '#F7F7F7', // Couleur à surcharger via palette
  },
  buttonPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    // backgroundColor: '#FF7CA3', // Couleur à surcharger via palette
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(255, 124, 163, 0.1)',
      },
      default: {
        shadowColor: '#FF7CA3', // Couleur à surcharger via palette
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  buttonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    // backgroundColor: '#F3F4F6', // Couleur à surcharger via palette
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 18,
    // color: '#FFFFFF', // Couleur à surcharger via palette
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    // borderColor: '#E0E0E0', // Couleur à surcharger via palette
    // backgroundColor: '#FFFFFF', // Couleur à surcharger via palette
    // color: '#23223B', // Couleur à surcharger via palette
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    // color: '#9A8C98', // Couleur à surcharger via palette
  },
}); 