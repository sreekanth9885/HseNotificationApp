import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { colors, typography } from '../theme/colors';

// Import Lucide icons
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Search,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  Calendar,
  MapPin,
  Key,
  Fingerprint,
  AtSign,
  Smartphone,
  CheckCircle,
} from 'lucide-react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  leftIcon?: string; // This will be used to map to Lucide icon names
  rightIcon?: string;
  onRightIconPress?: () => void;
  editable?: boolean;
  maxLength?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

// Helper function to map icon names to Lucide components
const getIcon = (iconName: string, props: any) => {
  const iconProps = {
    size: 20,
    color: colors.textLight,
    strokeWidth: 1.5,
    ...props,
  };

  switch (iconName) {
    // Auth icons
    case 'email':
    case 'mail':
      return <Mail {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'phone':
    case 'mobile':
      return <Phone {...iconProps} />;
    case 'smartphone':
      return <Smartphone {...iconProps} />;
    case 'at':
    case 'at-sign':
      return <AtSign {...iconProps} />;

    // Form icons
    case 'search':
      return <Search {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'location':
    case 'map-pin':
      return <MapPin {...iconProps} />;
    case 'key':
      return <Key {...iconProps} />;
    case 'fingerprint':
      return <Fingerprint {...iconProps} />;

    // Action icons
    case 'close':
    case 'x':
      return <X {...iconProps} />;
    case 'check':
      return <Check {...iconProps} />;
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'alert':
    case 'alert-circle':
      return <AlertCircle {...iconProps} />;
    case 'chevron-down':
      return <ChevronDown {...iconProps} />;

    // Eye icons (for password visibility)
    case 'eye':
      return <Eye {...iconProps} />;
    case 'eye-off':
      return <EyeOff {...iconProps} />;

    // Default fallback
    default:
      return <User {...iconProps} />;
  }
};

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  maxLength,
  containerStyle,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getBorderColor = (): string => {
    if (error) return colors.danger;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          !editable && styles.disabledInput,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {getIcon(leftIcon, { color: error ? colors.danger : isFocused ? colors.primary : colors.textLight })}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            secureTextEntry && styles.inputWithRightIcon,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          maxLength={maxLength}
        />
        
        {secureTextEntry ? (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            {getIcon(showPassword ? 'eye-off' : 'eye', {
              color: isFocused ? colors.primary : colors.textLight
            })}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
              {getIcon(rightIcon, { color: isFocused ? colors.primary : colors.textLight })}
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          {getIcon('alert-circle', { size: 14, color: colors.danger })}
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.body2,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    ...typography.body1,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginLeft: 16,
  },
  rightIcon: {
    marginRight: 16,
  },
  disabledInput: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
    gap: 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
});

export default Input;