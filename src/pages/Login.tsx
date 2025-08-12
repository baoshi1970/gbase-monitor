import React from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation('common');
  const [form] = Form.useForm();

  const handleSubmit = (values: LoginForm) => {
    console.log('Login attempt:', values);
    // TODO: 实现登录逻辑
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Language switcher in top right corner */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <Text className="text-white font-bold text-2xl">G</Text>
          </div>

          {/* Title */}
          <Title level={2} className="text-gray-800 mb-2">
            {t('appName')}
          </Title>
          <Text className="text-gray-500">{t('appDescription')}</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label={t('auth.username')}
            rules={[
              {
                required: true,
                message: t('auth.pleaseEnterUsername'),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder={t('auth.pleaseEnterUsername')}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[
              {
                required: true,
                message: t('auth.pleaseEnterPassword'),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder={t('auth.pleaseEnterPassword')}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full rounded-lg h-12 text-base font-medium"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            © 2025 GBase Monitor. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
