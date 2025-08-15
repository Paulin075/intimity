import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    // Le test passe si l'application se rend sans erreur
  });
});
