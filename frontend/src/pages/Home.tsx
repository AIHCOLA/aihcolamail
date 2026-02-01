import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, Check, Sparkles, Shield, Zap } from 'lucide-react';
import { api, Mailbox } from '../utils/api';

export default function Home() {
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCreateMailbox = async () => {
    setLoading(true);
    try {
      const response = await api.createMailbox();
      setMailbox(response.mailbox);
      navigate(`/mailbox/${response.mailbox.id}`);
    } catch (error) {
      console.error('创建邮箱失败:', error);
      alert('创建邮箱失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!mailbox) return;
    try {
      await navigator.clipboard.writeText(mailbox.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          临时邮箱系统
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          快速生成临时邮箱地址，安全接收验证码和邮件，保护您的隐私
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={handleCreateMailbox}
            disabled={loading}
            className="btn-primary text-lg px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                立即生成邮箱
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            快速生成
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            一键生成临时邮箱地址，无需注册，立即使用
          </p>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            隐私保护
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            保护您的真实邮箱地址，避免垃圾邮件骚扰
          </p>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            实时接收
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            实时接收邮件，支持查看HTML和纯文本格式
          </p>
        </div>
      </div>

      {/* Generated Mailbox Display */}
      {mailbox && (
        <div className="card p-6 max-w-2xl mx-auto animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            您的临时邮箱已生成
          </h2>
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="flex-1 text-lg font-mono text-gray-900 dark:text-white">
              {mailbox.email}
            </code>
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            此邮箱地址可用于接收验证码和邮件
          </p>
        </div>
      )}
    </div>
  );
}
