'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ResourceCard from '@/components/ResourceCard';
import { resources, currentUser } from '@/lib/utils';
import { StarIcon, EyeIcon, ArrowDownTrayIcon, ClockIcon, UserIcon, TagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { checkDownloadRestrictions, processDownload, DownloadResult, getUserDownloadQuota } from '@/lib/download';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function ResourceDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const resourceId = params.id as string;
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev: { id: number; title: string } | null; next: { id: number; title: string } | null }>({ prev: null, next: null })
  const [hotTags, setHotTags] = useState<{ id: number; name: string }[]>([])
  const [latestArticles, setLatestArticles] = useState<{ id: number; title: string }[]>([])
  const [guessList, setGuessList] = useState<{ id: number; title: string; coverImage: string; category: string }[]>([])

  useEffect(() => {
    const load = async () => {
      if (!resourceId) return
      try {
        const res = await fetch(`/api/resources/${resourceId}`)
        if (!res.ok) { setLoading(false); return }
        const json = await res.json()
        const r = json?.data
        if (!r) { setLoading(false); return }
        const firstDl = Array.isArray(r.downloads) && r.downloads.length ? r.downloads[0] : null
        const mapped = {
          id: String(r.id),
          title: r.title,
          category: r.category?.name || '其他',
          categoryId: r.category?.id || null,
          subcategory: r.subcategory?.name || '',
          subcategoryId: r.subcategory?.id || null,
          description: r.content || '',
          coverImage: r.cover || 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=600&fit=crop',
          downloadUrl: firstDl?.url || '',
          downloadCode: firstDl?.code || '',
          price: Number(r.price || 0),
          tags: Array.isArray(r.tags) ? r.tags.map((t: any) => t.name) : [],
          isNew: false,
          isPopular: false,
          isVipOnly: false,
        }
        setResource(mapped)
        // 获取上一篇/下一篇
        try {
          const pnRes = await fetch(`/api/resources/prev-next?id=${r.id}`)
          if (pnRes.ok) {
            const pn = await pnRes.json()
            setPrevNext({ prev: pn?.data?.prev || null, next: pn?.data?.next || null })
          }
        } catch {}
        // 获取随机资源6条作为猜你喜欢
        try {
          const gRes = await fetch('/api/resources/random?size=6')
          if (gRes.ok) {
            const gj = await gRes.json()
            const list = Array.isArray(gj?.data) ? gj.data : []
            const mapped = list.map((r: any) => ({
              id: r.id,
              title: r.title,
              coverImage: r.cover || 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=600&fit=crop',
              category: r.subcategoryName || r.categoryName || '其他',
            }))
            setGuessList(mapped)
          }
        } catch {}
        // 获取最新文章（最新10条）
        try {
          const laRes = await fetch('/api/resources?page=1&size=10')
          if (laRes.ok) {
            const laj = await laRes.json()
            const list = Array.isArray(laj?.data) ? laj.data : []
            setLatestArticles(list.map((r: any) => ({ id: r.id, title: r.title })))
          }
        } catch {}
        try {
          const tRes = await fetch('/api/tags')
          if (tRes.ok) {
            const tj = await tRes.json()
            setHotTags(Array.isArray(tj?.data) ? tj.data : [])
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resourceId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">资源未找到</h1>
          <Link href="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const restrictions = checkDownloadRestrictions(resource, currentUser);
  const extractionCode = resource.downloadCode || '';
  const tagColors = ['#1f2937','#374151','#4b5563','#2563eb','#7c3aed','#0f766e','#b91c1c','#6b21a8','#1d4ed8','#15803d'];
  const currentIndex = resources.findIndex(r => r.id === resourceId);
  const prevResource = currentIndex > 0 ? resources[currentIndex - 1] : null;
  const nextResource = currentIndex >= 0 && currentIndex < resources.length - 1 ? resources[currentIndex + 1] : null;
  const likedResources = resources.filter(r => r.id !== resourceId).slice(0, 6);

  const copyExtractionCode = () => {
    navigator.clipboard?.writeText(extractionCode).then(() => {
      toast('提取码已复制', 'success');
    }).catch(() => {
      toast('复制失败，请手动选择提取码复制', 'error');
    });
  };

  const handleDownload = async () => {
    const restrictions = checkDownloadRestrictions(resource, currentUser);

    if (!restrictions.canDownload) {
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }

      if (restrictions.requiresVip) {
        setShowDownloadModal(true);
        return;
      }

      if (restrictions.requiresPayment) {
        setShowPaymentModal(true);
        return;
      }

      // Show restriction message
      toast(restrictions.reason || '无法下载', 'error');
      return;
    }

    // Process the download
    const result: DownloadResult = await processDownload(resource, currentUser);
    
    if (result.success) {
      toast(`${result.message} (交易ID: ${result.transactionId})`, 'success');
      // In a real app, you would start the actual download here
      // window.location.href = resource.downloadUrl;
    } else {
      toast(result.message || '下载失败', 'error');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarSolidIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">首页</Link>
          <span>/</span>
          {resource.categoryId ? (
            <Link href={`/category/${resource.categoryId}`} className="hover:text-primary">{resource.category || '未分类'}</Link>
          ) : (
            <span className="text-muted-foreground">{resource.category || '未分类'}</span>
          )}
          {resource.subcategoryId ? (
            <>
              <span>/</span>
              <Link href={`/category/${resource.categoryId}/${resource.subcategoryId}`} className="hover:text-primary">{resource.subcategory}</Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-foreground">{resource.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Resource Header */}
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {resource.isNew && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    最新
                  </span>
                )}
                {resource.isPopular && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    热门
                  </span>
                )}
                {resource.isVipOnly && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3" />
                    VIP专享
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">{resource.title}</h1>

              {/* Category info: show last level only with gray dot */}
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <span className="inline-block w-3 h-3 rounded-full border border-gray-400 mr-2"></span>
                <span>{resource.subcategory || resource.category || '未分类'}</span>
              </div>

              {/* Meta info removed per request */}

              {/* Markdown Content */}
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed mb-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl md:text-2xl font-semibold mt-4 mb-2 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg md:text-xl font-semibold mt-3 mb-2 text-foreground">{children}</h3>
                    ),
                    // 改为 any 以避免 TS 对 inline 属性报错
                    code: ({ inline, className, children, ...props }: any) => {
                      const langClass = className || ''
                      if (inline) {
                        return <code className={`hljs ${langClass}`} {...props}>{children}</code>
                      }
                      return (
                        <pre className="hljs">
                          <code className={`hljs ${langClass}`} {...props}>{children}</code>
                        </pre>
                      )
                    },
                  }}
                >
                  {resource.description || ''}
                </ReactMarkdown>
              </div>

              {/* Download section: always show both styles */}
              <div className="space-y-4">
                {/* 有下载权限时的展示 */}
                <div className="border-2 border-pink-300 border-dashed rounded-md p-4">
                  <div className="flex items-center flex-wrap gap-2 text-sm md:text-base text-foreground">
                    <span>链接</span>
                    <a
                      href={resource.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-pink-500 text-white px-3 py-1 text-xs md:text-sm hover:opacity-90"
                    >
                      点击下载
                    </a>
                    <span className="text-sm text-muted-foreground">（提取码: {extractionCode}）</span>
                    <button
                      onClick={copyExtractionCode}
                      className="text-pink-500 hover:underline text-xs md:text-sm"
                    >
                      复制
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    支付后点击下载按钮即可查看网盘链接，如果链接失效，可联系本站客服。
                  </p>
                </div>

                {/* 无下载权限时的展示 */}
                <div className="border-2 border-pink-300 border-dashed rounded-md p-4">
                  <div className="flex items-center flex-wrap gap-2 text-sm md:text-base text-foreground">
                    <span>资源下载价格</span>
                    <span className="font-semibold text-pink-500">{resource.price} 元</span>
                    <button
                      onClick={handleDownload}
                      className="rounded-full bg-pink-500 text-white px-3 py-1 text-xs md:text-sm hover:opacity-90"
                    >
                      立即交易
                    </button>
                    <span className="mx-1 text-muted-foreground">或</span>
                    <span>升级VIP后免费</span>
                    <Link href="/vip" className="rounded-full bg-yellow-400 text-black px-3 py-1 text-xs md:text-sm hover:opacity-90">
                      立即升级
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    支付后点击下载按钮即可查看网盘链接，如果链接失效，可联系本站客服。
                  </p>
                </div>
              </div>
              {/* Tags inside card bottom */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {resource.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs md:text-sm rounded-none text-white hover:opacity-90 cursor-pointer transition-colors"
                    style={{ backgroundColor: tagColors[index % tagColors.length] }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Prev/Next navigation */}
              <div className="py-4 px-2 md:px-4 bg-card rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {prevNext.prev && (
                      <>
                        <div className="text-xs text-muted-foreground mb-1">上一篇</div>
                        <Link href={`/resource/${prevNext.prev.id}`} className="block text-black font-semibold hover:underline truncate">
                          {prevNext.prev.title}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="h-6 mx-4 border-l border-dashed border-border" />
                  <div className="text-right flex-1 min-w-0">
                    {prevNext.next && (
                      <>
                        <div className="text-xs text-muted-foreground mb-1">下一篇</div>
                        <Link href={`/resource/${prevNext.next.id}`} className="block text-black font-semibold hover:underline truncate">
                          {prevNext.next.title}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Guess you like (separate block) */}
              <div className="py-4 px-2 md:px-4 bg-card rounded-lg shadow-sm mt-4">
                <div className="text-sm text-foreground font-bold mb-2">猜你喜欢</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {guessList.map((res, idx) => (
                    <ResourceCard key={res.id} resource={res} index={idx} />
                  ))}
                </div>
              </div>
          </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Resource Download (always visible) */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">资源下载</h3>
                <div className="text-sm text-muted-foreground mb-2">链接:</div>
                <a
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg bg-pink-500 text-white text-center py-3 hover:opacity-90"
                >
                  点击下载
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  支付后点击下载按钮即可查看网盘链接，如果链接失效，可联系本站客服。
                </p>
              </div>

              {/* No-permission purchase/VIP hint (always visible as requested) */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-pink-500">{resource.price}</span>
                  <span className="ml-1 text-base text-foreground">元</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>VIP免费查看/下载</span>
                  <Link href="/vip" className="rounded-full bg-yellow-400 text-black px-3 py-1 text-xs hover:opacity-90">
                    升级VIP
                  </Link>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full rounded-lg bg-pink-500 text-white py-3 hover:opacity-90"
                >
                  立即交易
                </button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  支付后点击下载按钮即可查看网盘链接，如果链接失效，可联系本站客服。
                </p>
              </div>

            {/* Latest Articles */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">最新文章</h3>
              <div className="space-y-2">
                {latestArticles.map((r) => (
                  <Link
                    key={r.id}
                    href={`/resource/${r.id}`}
                    className="block text-foreground hover:underline truncate font-medium"
                  >
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Hot Tags */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">热门标签</h3>
              <div className="flex flex-wrap gap-2">
                {hotTags.map((tag, idx) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-xs md:text-sm rounded-none text-white hover:opacity-90"
                    style={{ backgroundColor: tagColors[idx % tagColors.length] }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">VIP专享资源</h3>
            <p className="text-muted-foreground mb-6">
              此资源为VIP专享，需要开通VIP会员才能下载。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 btn btn-secondary"
              >
                取消
              </button>
              <Link href="/vip" className="flex-1 btn btn-accent">
                开通VIP
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">付费下载</h3>
            <p className="text-muted-foreground mb-4">
              此资源需要支付 ¥{resource.price} 后才能下载。
            </p>
            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-sm text-secondary-foreground mb-2">选择支付方式:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-primary" />
                  <span className="text-foreground">支付宝</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" className="text-primary" />
                  <span className="text-foreground">微信支付</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  toast('跳转到支付页面...', 'info');
                  setShowPaymentModal(false);
                }}
                className="flex-1 btn btn-primary"
              >
                立即支付
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}