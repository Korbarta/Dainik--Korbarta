import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { NewsArticle, Category, PhotoAlbum, VideoNews, Reporter, AuthUser } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { AdBanner } from './components/common/AdBanner';
import { BreakingTicker } from './components/common/BreakingTicker';
import { HeroSection } from './components/home/HeroSection';
import { CategoryNewsBlock } from './components/home/CategoryNewsBlock';
import { MediaShowcaseSection } from './components/home/MediaShowcaseSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { ArticleDetailPage } from './components/news/ArticleDetailPage';
import { CategoryArchivePage } from './components/news/CategoryArchivePage';
import { PhotoGalleryPage } from './components/gallery/PhotoGalleryPage';
import { VideoGalleryPage } from './components/gallery/VideoGalleryPage';
import { ReporterProfilePage } from './components/reporter/ReporterProfilePage';
import { SearchPage } from './components/search/SearchPage';
import { StaticPages } from './components/pages/StaticPages';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);

  // Data state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [photoAlbums, setPhotoAlbums] = useState<PhotoAlbum[]>([]);
  const [videos, setVideos] = useState<VideoNews[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(StorageService.getCurrentUser());

  // Load all initial data from reactive StorageService
  const loadData = () => {
    const allArticles = StorageService.getNews();
    setArticles(allArticles);
    setCategories(StorageService.getCategories());
    setPhotoAlbums(StorageService.getPhotoAlbums());
    setVideos(StorageService.getVideos());
    setCurrentUser(StorageService.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('karbarta_storage_update', loadData);
    return () => window.removeEventListener('karbarta_storage_update', loadData);
  }, []);

  // Generic navigation handler
  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'article' && param) {
      const art = articles.find((a) => a.id === param || a.slug === param);
      if (art) setSelectedArticle(art);
    }
  };

  // Article selection helper
  const handleSelectArticle = (art: NewsArticle) => {
    setSelectedArticle(art);
    setCurrentPage('article');
    setPageParam(art.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tag click helper
  const handleSelectTag = (tag: string) => {
    setCurrentPage('tag');
    setPageParam(tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category news helpers for home
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const nationalArticles = publishedArticles.filter((a) => a.categorySlug === 'national');
  const politicsArticles = publishedArticles.filter((a) => a.categorySlug === 'politics');
  const sportsArticles = publishedArticles.filter((a) => a.categorySlug === 'sports');
  const entertainmentArticles = publishedArticles.filter((a) => a.categorySlug === 'entertainment');
  const techArticles = publishedArticles.filter((a) => a.categorySlug === 'technology');
  const businessArticles = publishedArticles.filter((a) => a.categorySlug === 'business');
  const intlArticles = publishedArticles.filter((a) => a.categorySlug === 'international');

  // If on Admin page, show login if not authenticated, else AdminDashboard
  if (currentPage === 'admin') {
    if (!currentUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => setCurrentUser(user)}
          onBackToSite={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={() => {
          StorageService.setCurrentUser(null);
          setCurrentUser(null);
          handleNavigate('home');
        }}
        onViewLiveSite={() => handleNavigate('home')}
        onSelectArticlePreview={(art) => handleSelectArticle(art)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 font-sans-bangla flex flex-col antialiased selection:bg-rose-200 selection:text-rose-900">
      
      {/* 1. Breaking News Ticker */}
      <BreakingTicker
        onSelectArticle={(id) => {
          const art = articles.find((a) => a.id === id);
          if (art) handleSelectArticle(art);
        }}
      />

      {/* 2. Professional Newspaper Header & Nav */}
      <Header
        activeCategory={currentPage === 'category' ? pageParam : undefined}
        onSelectCategory={(slug) => {
          if (slug === 'home') handleNavigate('home');
          else handleNavigate('category', slug);
        }}
        onSearch={(q) => handleNavigate('search', q)}
        onOpenAdmin={() => handleNavigate('admin')}
        onNavigate={handleNavigate}
      />

      {/* Top Banner Advertisement (Below Navigation) */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdBanner position="header_top" />
      </div>

      {/* 3. Main Dynamic Content Switcher */}
      <main className="flex-1 pb-16 lg:pb-0">
        
        {/* HOMEPAGE VIEW */}
        {currentPage === 'home' && (
          <div className="max-w-7xl mx-auto px-4">
            {/* Hero Section: Lead story + Secondary grid + Latest / Most Read tabs */}
            <HeroSection
              articles={publishedArticles}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={(slug) => handleNavigate('category', slug)}
              onSelectReporter={(repId) => handleNavigate('reporter', repId)}
            />

            {/* Mid Page Ad */}
            <AdBanner position="home_middle" className="my-6" />

            {/* Categorized Newspaper Grids */}
            <div className="grid grid-cols-1 gap-4">
              <CategoryNewsBlock
                title="জাতীয় সংবাদ"
                slug="national"
                articles={nationalArticles}
                accentColor="#b91c1c"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="রাজনীতি"
                slug="politics"
                articles={politicsArticles}
                accentColor="#1d4ed8"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="আন্তর্জাতিক"
                slug="international"
                articles={intlArticles}
                accentColor="#0f766e"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="বাণিজ্য ও অর্থনীতি"
                slug="business"
                articles={businessArticles}
                accentColor="#b45309"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="খেলাধুলা"
                slug="sports"
                articles={sportsArticles}
                accentColor="#15803d"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="প্রযুক্তি ও উদ্ভাবন"
                slug="technology"
                articles={techArticles}
                accentColor="#6d28d9"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />

              <CategoryNewsBlock
                title="বিনোদন ও সংস্কৃতি"
                slug="entertainment"
                articles={entertainmentArticles}
                accentColor="#be185d"
                onSelectArticle={handleSelectArticle}
                onSelectCategory={(slug) => handleNavigate('category', slug)}
              />
            </div>

            {/* Media Showcase: Photo Album Grid & Video Cinema Player */}
            <MediaShowcaseSection
              photoAlbums={photoAlbums}
              videos={videos}
              onNavigate={handleNavigate}
            />

            {/* Newsletter Subscription Box */}
            <NewsletterSection />
          </div>
        )}

        {/* ARTICLE DETAIL VIEW */}
        {currentPage === 'article' && selectedArticle && (
          <ArticleDetailPage
            article={selectedArticle}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={(slug) => handleNavigate('category', slug)}
            onSelectReporter={(repId) => handleNavigate('reporter', repId)}
            onSelectTag={handleSelectTag}
          />
        )}

        {/* CATEGORY OR LATEST OR TAG ARCHIVE VIEW */}
        {(currentPage === 'category' || currentPage === 'latest' || currentPage === 'tag') && (
          <CategoryArchivePage
            categorySlug={currentPage === 'category' ? pageParam : undefined}
            tag={currentPage === 'tag' ? pageParam : undefined}
            isLatestPage={currentPage === 'latest'}
            articles={publishedArticles}
            categories={categories}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={(slug) => {
              if (slug === 'home') handleNavigate('home');
              else handleNavigate('category', slug);
            }}
          />
        )}

        {/* PHOTO GALLERY VIEW */}
        {currentPage === 'photos' && (
          <PhotoGalleryPage
            initialAlbumId={pageParam}
            onSelectCategory={(slug) => handleNavigate(slug)}
          />
        )}

        {/* VIDEO GALLERY VIEW */}
        {currentPage === 'videos' && (
          <VideoGalleryPage
            onSelectCategory={(slug) => handleNavigate(slug)}
          />
        )}

        {/* REPORTER PROFILE VIEW */}
        {currentPage === 'reporter' && pageParam && (
          <ReporterProfilePage
            reporterId={pageParam}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={(slug) => handleNavigate('category', slug)}
          />
        )}

        {/* SEARCH VIEW */}
        {currentPage === 'search' && (
          <SearchPage
            initialQuery={pageParam}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={(slug) => handleNavigate('category', slug)}
            onSelectReporter={(repId) => handleNavigate('reporter', repId)}
            onSelectPhotoAlbum={(id) => handleNavigate('photos', id)}
            onSelectVideo={() => handleNavigate('videos')}
          />
        )}

        {/* STATIC PAGES: ABOUT, CONTACT, PRIVACY, TERMS, EPAPER */}
        {(currentPage === 'about' ||
          currentPage === 'contact' ||
          currentPage === 'privacy' ||
          currentPage === 'terms' ||
          currentPage === 'epaper') && (
          <StaticPages
            pageType={currentPage as any}
            onNavigate={handleNavigate}
          />
        )}

      </main>

      {/* 4. Newspaper Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 5. Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
