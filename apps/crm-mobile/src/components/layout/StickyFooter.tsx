import React from 'react';
import { View, StyleSheet } from 'react-native';

import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import type { ButtonSpec } from '../../types/domain';

type Props = {
  primary?: ButtonSpec;
  secondary?: ButtonSpec;
};

function renderButton(spec: ButtonSpec, key: string) {
  const variant = spec.variant ?? 'primary';

  if (variant === 'primary') {
    return <PrimaryButton key={key} label={spec.label} onPress={spec.onPress} disabled={spec.disabled} loading={spec.loading} />;
  }
  if (variant === 'secondary') {
    return <SecondaryButton key={key} label={spec.label} onPress={spec.onPress} disabled={spec.disabled} loading={spec.loading} />;
  }
  if (variant === 'outline' || variant === 'danger') {
    return <OutlineButton key={key} label={spec.label} onPress={spec.onPress} disabled={spec.disabled} loading={spec.loading} variant={variant} />;
  }
  return null;
}

export function StickyFooter({ primary, secondary }: Props) {
  return (
    <View style={styles.row}>
      {secondary ? <View style={styles.btn}>{renderButton(secondary, 'secondary')}</View> : null}
      {primary ? <View style={styles.btn}>{renderButton(primary, 'primary')}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1 },
});
