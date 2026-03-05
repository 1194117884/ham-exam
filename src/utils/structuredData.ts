import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataProps {
  type: string;
  data: any;
}

export const useStructuredData = (structuredData: StructuredDataProps[]) => {
  useEffect(() => {
    // 清除之前的结构化数据
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // 添加新的结构化数据
    structuredData.forEach((item, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${index}`;
      script.textContent = JSON.stringify(item.data);
      document.head.appendChild(script);
    });

    // 清理函数
    return () => {
      const addedScripts = document.querySelectorAll('script[id^="structured-data-"]');
      addedScripts.forEach(script => script.remove());
    };
  }, [structuredData]);
};

export const useBreadcrumbData = (breadcrumbs: BreadcrumbItem[]) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };

  useStructuredData([{ type: "breadcrumb", data: breadcrumbData }]);
};

export const useOrganizationSchema = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "业余无线电学习平台",
    "description": "专业的业余无线电考试学习平台，提供A、B、C类题库练习、模拟考试和错题本功能",
    "url": "https://cqcq.yongkl.cc",
    "logo": "https://cqcq.yongkl.cc/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
      "contactType": "customer service"
    },
    "sameAs": []
  };

  useStructuredData([{ type: "organization", data: organizationData }]);
};

export const useCourseSchema = (courseName: string, courseDescription: string) => {
  const courseData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": courseName,
    "description": courseDescription,
    "provider": {
      "@type": "Organization",
      "name": "业余无线电学习平台",
      "sameAs": "https://cqcq.yongkl.cc"
    }
  };

  useStructuredData([{ type: "course", data: courseData }]);
};