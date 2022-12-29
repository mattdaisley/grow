import { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';

export const NumberFormatCustom = forwardRef(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;
  // console.log(props)
  return (
    <NumericFormat
      thousandsGroupStyle="thousand"
      thousandSeparator=","
      decimalScale={3}
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: Number(values.value),
          },
        });
      }} />
  );
});
