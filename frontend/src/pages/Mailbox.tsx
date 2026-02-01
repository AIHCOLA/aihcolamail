import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Copy, Trash2, RefreshCw, ArrowLeft, History, RotateCcw, ChevronDown } from 'lucide-react';
import { api, Mailbox as MailboxType, Email } from '../utils/api';
import { useMailboxHistory } from '../utils/history';
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
  const { history } = useMailboxHistory();
  const [showHistory, setShowHistory] = useState(false);

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

  const handleReset = () => {
    if (confirm('确定要重置当前会话并返回首页重新生成邮箱吗？')) {
      navigate('/');
    }
  };

  const handleHistorySelect = (mailboxId: string) => {
    setShowHistory(false);
    navigate(`/mailbox/${mailboxId}`);
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
    if (!confirm('确定要删除这个邮箱吗？这个邮件将被永久删除。')) return;
    
    // 这里如果只是清空邮件，目前 API 好像只有删除整个邮箱的接口
    // 如果用户意图是“删除这个邮箱”，则保持原逻辑。但根据用户描述，"删除"功能用于删除邮件。
    // 假设目前后端只支持删除邮箱，那我们还是先保持删除邮箱的逻辑，或者提示用户。
    // 但根据用户反馈："刷新和删除的功能应该用于删除收件箱中的邮件的"
    // 如果没有“清空邮件”接口，我们暂时只能保留“删除邮箱”功能，但将其位置调整到邮件列表区域，
    // 或者我们假装删除邮件（实际上还是删除邮箱？不，这样会误导）。
    // 
    // 既然用户希望“刷新和删除”是针对邮件的，那我们可以把删除按钮理解为“删除当前选中的邮件”或者“清空邮件”。
    // 由于目前后端接口只有 deleteMailbox，没有 deleteEmail(批量) 或 clearEmails。
    // 我们暂时把这个删除按钮定义为“删除当前邮箱（销毁）”，但放在邮件列表头部可能更合适？
    // 不，用户说“生成的邮箱应该是使用重置和历史记录这两个功能”。
    // 那么旧的“删除”按钮（销毁邮箱）其实就是“重置”的一种激进形式。
    // 
    // 让我们先把顶部区域改为“重置”和“历史记录”。
    // 邮件列表区域放“刷新”。至于“删除”，如果后端不支持删邮件，先隐藏或保留在不显眼处，或者作为“销毁此邮箱”的功能。
    
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
      {/* Header Area: Mailbox Info & Main Actions */}
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
            
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <code className="flex-1 min-w-[200px] px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                {mailbox.email}
              </code>
              
              <div className="flex gap-2">
                 <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </button>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center gap-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>

                {/* History Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                  >
                    <History className="w-4 h-4" />
                    历史记录
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showHistory && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {history.length === 0 ? (
                          <div className="text-center py-4 text-sm text-gray-500">暂无历史记录</div>
                        ) : (
                          history.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleHistorySelect(item.id)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 truncate ${
                                item.id === id ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {item.email}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                收件箱 ({emails.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                  title="刷新邮件"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                  title="销毁此邮箱"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
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
                    <p className="text-xs text-gray-500">
                      {format(email.received_at * 1000, 'HH:mm')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <div className="card p-6 h-full min-h-[500px]">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedEmail.subject || '(无主题)'}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">发件人:</span>{' '}
                      {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                    </p>
                    <p>
                      <span className="font-medium">时间:</span>{' '}
                      {format(selectedEmail.received_at * 1000, 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {selectedEmail.html_content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                    className="email-content"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                    {selectedEmail.text_content}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6 h-full min-h-[500px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Mail className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">选择一个邮件查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
