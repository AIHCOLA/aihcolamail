import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Copy, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { api, Mailbox as MailboxType, Email } from '../utils/api';
import { format } from 'date-fns';

export default function MailboxPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mailbox, setMailbox] = useState<MailboxType | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadMailbox();
      loadEmails();
      // 每30秒刷新一次邮件列表
      const interval = setInterval(loadEmails, 30000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadMailbox = async () => {
    if (!id) return;
    try {
      const response = await api.getMailbox(id);
      setMailbox(response.mailbox);
    } catch (error) {
      console.error('加载邮箱失败:', error);
    }
  };

  const loadEmails = async () => {
    if (!id) return;
    try {
      const response = await api.getEmails(id);
      setEmails(response.emails.sort((a, b) => b.received_at - a.received_at));
    } catch (error) {
      console.error('加载邮件失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmails();
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

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('确定要删除这个邮箱吗？所有邮件将被永久删除。')) return;
    
    try {
      await api.deleteMailbox(id);
      navigate('/');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleEmailClick = async (email: Email) => {
    try {
      const response = await api.getEmail(email.id);
      setSelectedEmail(response.email);
    } catch (error) {
      console.error('加载邮件详情失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mailbox) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">邮箱不存在</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                我的邮箱
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <code className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                {mailbox.email}
              </code>
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Copy className="w-4 h-4" />
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
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              收件箱 ({emails.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {emails.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无邮件</p>
                </div>
              ) : (
                emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedEmail?.id === email.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {email.from_name || email.from_email}
                      </p>
                      {email.is_read === 0 && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                      {email.subject || '(无主题)'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {format(new Date(email.received_at * 1000), 'MM月dd日 HH:mm')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <div className="card p-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {selectedEmail.subject || '(无主题)'}
                </h2>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">发件人:</span> {selectedEmail.from_name || selectedEmail.from_email}
                  </p>
                  <p>
                    <span className="font-medium">时间:</span>{' '}
                    {format(new Date(selectedEmail.received_at * 1000), 'yyyy年MM月dd日 HH:mm:ss')}
                  </p>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {selectedEmail.html_content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                    className="email-content"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 font-sans">
                    {selectedEmail.text_content || '(无内容)'}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">
                选择一个邮件查看详情
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
