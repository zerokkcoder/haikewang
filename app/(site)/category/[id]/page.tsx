'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ResourceCard from '@/components/ResourceCard';

export default function CategoryPage() {
  const params = useParams();
  const categoryIdNum = Number(params.id as string);
  const [category, setCategory] = useState<any>(null);
  const [displayedResources, setDisplayedResources] = useState<{ id: number; coverImage: string; title: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size] = useState(6);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastPageRef = useRef(0);
  const loadedIdsRef = useRef<Set<number>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
  const [sort, setSort] = useState<'latest' | 'downloads' | 'views' | 'comments'>('latest')
  const [siteConfig, setSiteConfig] = useState<{ heroImage?: string | null } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch('/api/site/settings', { signal: controller.signal, cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json?.success) setSiteConfig(json.data)
      } catch {}
    }
    load()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await fetch('/api/categories')
        const json = await res.json().catch(() => null)
        if (res.ok && json?.success) {
          const list = Array.isArray(json.data) ? json.data : []
          const found = list.find((c: any) => Number(c.id) === categoryIdNum)
          setCategory(found || null)
        }
      } catch {}
    }
    loadCategory()
  }, [categoryIdNum])

  const loadMoreResources = async (
    sortOverride?: 'latest' | 'downloads' | 'views',
    pageOverride?: number,
    force?: boolean,
  ) => {
    if (!categoryIdNum) return
    if ((isLoading || !hasMore) && !force) return
    setIsLoading(true)
    let computedTotal = 0
    let nextHasMoreFlag = false
    try {
      const requestedPage = pageOverride ?? page
      if (requestedPage === lastPageRef.current) { setIsLoading(false); return }
      const activeSort = sortOverride ?? sort
      const url = `/api/resources?page=${requestedPage}&size=${size}&categoryId=${categoryIdNum}&sort=${activeSort}`
      const res = await fetch(url)
      if (!res.ok) { setIsLoading(false); return }
      let data: any = null
      try { data = await res.json() } catch { setIsLoading(false); return }
      const list = Array.isArray(data?.data) ? data.data : []
      const pg = data?.pagination; if (pg) { computedTotal = pg.total || 0; setTotal(computedTotal) }
      if (list.length === 0) {
        lastPageRef.current = requestedPage
        setPage(requestedPage + 1)
        setIsLoading(false)
        return
      }
      const next = list.map((r: any) => ({ id: r.id, title: r.title, coverImage: r.cover || 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=600&fit=crop', category: r.subcategoryName || r.categoryName || '其他', categoryId: r.categoryId, subcategoryId: r.subcategoryId }))
      const filtered = next.filter((item: { id: number }) => !loadedIdsRef.current.has(item.id))
      filtered.forEach((item: { id: number }) => loadedIdsRef.current.add(item.id))
      setDisplayedResources(prev => [...prev, ...filtered])
      const loadedCount = loadedIdsRef.current.size
      nextHasMoreFlag = (filtered.length > 0) && (computedTotal === 0 || loadedCount < computedTotal)
      lastPageRef.current = requestedPage
      if (nextHasMoreFlag) { setPage(requestedPage + 1) } else { setAutoLoadEnabled(false); setTotal(loadedCount) }
    } catch {} finally {
      setIsLoading(false)
      setHasMore(nextHasMoreFlag)
      setAutoLoadEnabled(nextHasMoreFlag && computedTotal > 0)
    }
  }

  useEffect(() => {
    // reset and initial load
    setDisplayedResources([])
    setTotal(0)
    setPage(1)
    lastPageRef.current = 0
    loadedIdsRef.current.clear()
    setHasMore(true)
    setAutoLoadEnabled(false)
    setIsLoading(false)
    ;(async () => { await loadMoreResources(sort, 1, true) })()
  }, [categoryIdNum])

  useEffect(() => {
    if (!autoLoadEnabled) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => { const [entry] = entries; if (entry.isIntersecting && hasMore && !isLoading) { loadMoreResources() } }, { root: null, rootMargin: '200px', threshold: 0 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [autoLoadEnabled, displayedResources.length, isLoading, page, total])

  const handleSortChange = (nextSort: 'latest' | 'downloads' | 'views' | 'comments') => {
    if (sort === nextSort) return
    setDisplayedResources([])
    setTotal(0)
    setPage(1)
    lastPageRef.current = 0
    loadedIdsRef.current.clear()
    setHasMore(true)
    setAutoLoadEnabled(false)
    setIsLoading(false)
    setSort(nextSort)
    ;(async () => { await loadMoreResources(nextSort, 1, true) })()
  }

  if (isLoading && displayedResources.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">分类未找到</h1>
          <Link href="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // use displayedResources instead of local mock pagination

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Hero section with centered text */}
        <section className="mb-6">
          <div className="relative w-screen left-1/2 -translate-x-1/2 h-48 md:h-64 overflow-hidden border border-border bg-card">
            <Image
              src={siteConfig?.heroImage || "/haike_hero.svg"}
              alt="Category Hero"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
                <p className="text-sm md:text-base opacity-90">共找到 {total || displayedResources.length} 个资源</p>
              </div>
            </div>
          </div>
        </section>

        {/* 顶部过滤卡片：样式与首页一致，整合“分类 + 排序” */}
        <div className="rounded-lg border border-border bg-card p-3 text-sm mt-4">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-muted-foreground">分类</span>
            <Link
              href={`/category/${categoryIdNum}`}
              className="px-2 py-0.5 rounded-full bg-violet-500 text-white"
            >
              全部
            </Link>
            {category.subcategories && category.subcategories.length > 0 && (
              <>
                {category.subcategories.map((subcategory: any) => (
                  <Link
                    key={subcategory.id}
                    href={`/category/${categoryIdNum}/${subcategory.id}`}
                    className="px-2 py-0.5 rounded-full text-black"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">排序</span>
            <button onClick={() => handleSortChange('latest')} className={`px-2 py-0.5 rounded-full ${sort==='latest' ? 'bg-violet-500 text-white' : 'text-black'}`}>最新发布</button>
            <button onClick={() => handleSortChange('downloads')} className={`px-2 py-0.5 rounded-full ${sort==='downloads' ? 'bg-violet-500 text-white' : 'text-black'}`}>下载最多</button>
            <button onClick={() => handleSortChange('views')} className={`px-2 py-0.5 rounded-full ${sort==='views' ? 'bg-violet-500 text-white' : 'text-black'}`}>浏览最多</button>
          </div>
        </div>

        {/* Waterfall list same as home search */}

        {/* Resources Grid/List */}
        {displayedResources.length === 0 ? (
          <div className="text-center mt-4 py-16">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无资源</h3>
            <p className="text-muted-foreground">该分类下还没有资源，敬请期待。</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {displayedResources.map((resource, index) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-4" />
            {isLoading && (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </>
        )}

        {/* Infinite scroll sentinel and loader above */}
      </div>
    </div>
  );
}