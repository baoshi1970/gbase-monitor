import React from 'react';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    {
      key: 'zh',
      label: '简体中文',
      flag: '🇨🇳',
    },
    {
      key: 'en',
      label: 'English',
      flag: '🇺🇸',
    },
    {
      key: 'ja',
      label: '日本語',
      flag: '🇯🇵',
    },
  ];

  const currentLanguage =
    languages.find((lang) => lang.key === i18n.language) || languages[0];

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const menuItems = languages.map((lang) => ({
    key: lang.key,
    label: (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{lang.flag}</span>
        <span>{lang.label}</span>
      </div>
    ),
    onClick: () => handleLanguageChange(lang.key),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="flex items-center space-x-1 hover:bg-slate-100 transition-colors duration-200 rounded-lg"
        style={{
          color: '#475569',
          fontSize: '16px',
        }}
      >
        <span className="hidden sm:inline text-base">
          {currentLanguage.flag}
        </span>
        <span className="hidden md:inline text-slate-700 font-medium">
          {currentLanguage.label}
        </span>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
