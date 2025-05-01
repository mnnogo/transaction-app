import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ id, label, type, placeholder, value, onChange, required }) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={styles.input}
      />
    </div>
  );
};

export default InputField;