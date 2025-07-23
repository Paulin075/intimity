// Styles premium pour Intimity
import { StyleSheet } from 'react-native';

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
    // shadowColor: '#FF7CA3', // Couleur à surcharger via palette
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    // color: '#9A8C98', // Couleur à surcharger via palette
  },
}); 