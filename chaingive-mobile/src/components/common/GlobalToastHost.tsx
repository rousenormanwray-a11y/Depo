import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Toast from './Toast';
import { RootState } from '../../store/store';

const GlobalToastHost: React.FC = () => {
  const authError = useSelector((s: RootState) => s.auth.error);
  const marketplaceError = useSelector((s: RootState) => s.marketplace.error);
  const walletError = useSelector((s: RootState) => s.wallet.error);
  const donationError = useSelector((s: RootState) => s.donation.error);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const err = authError || marketplaceError || walletError || donationError || null;
    if (err) setMessage(err);
  }, [authError, marketplaceError, walletError, donationError]);

  return (
    <Toast
      visible={Boolean(message)}
      message={message || ''}
      type="error"
      onHide={() => setMessage(null)}
    />
  );
};

export default GlobalToastHost;
