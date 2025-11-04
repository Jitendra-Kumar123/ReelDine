import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = useCallback((name, value) => {
        const rules = validationRules[name];
        if (!rules) return '';

        // Required validation
        if (rules.required && (!value || value.toString().trim() === '')) {
            return rules.required.message || `${name} is required`;
        }

        // Email validation
        if (rules.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return rules.email.message || 'Please enter a valid email address';
            }
        }

        // Min length validation
        if (rules.minLength && value && value.length < rules.minLength.value) {
            return rules.minLength.message || `Minimum ${rules.minLength.value} characters required`;
        }

        // Max length validation
        if (rules.maxLength && value && value.length > rules.maxLength.value) {
            return rules.maxLength.message || `Maximum ${rules.maxLength.value} characters allowed`;
        }

        // Pattern validation
        if (rules.pattern && value && !rules.pattern.value.test(value)) {
            return rules.pattern.message || 'Invalid format';
        }

        // Custom validation function
        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value, values);
            if (customError) return customError;
        }

        return '';
    }, [validationRules, values]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validationRules, validateField]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setValues(prev => ({
            ...prev,
            [name]: fieldValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field on blur
        const error = validateField(name, values[name]);
        if (error) {
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    }, [values, validateField]);

    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate all fields
        const isValid = validateForm();

        if (isValid) {
            try {
                await onSubmit(values);
            } catch (error) {
                // Handle submission error
                console.error('Form submission error:', error);
            }
        }

        setIsSubmitting(false);
    }, [values, validateForm]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
        validateForm,
        isValid: Object.keys(errors).length === 0
    };
};
