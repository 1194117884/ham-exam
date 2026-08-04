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

// 首页 FAQPage 结构化数据
export const useFAQPageSchema = () => {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "什么是业余无线电操作证书？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "业余无线电操作证书是中国无线电管理机构颁发的资格证书，分为A、B、C三类，持证人可在规定频段和功率范围内进行业余无线电通信。"
        }
      },
      {
        "@type": "Question",
        "name": "A类、B类、C类证书有什么区别？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A类证书为入门级，可在30-3000MHz频段使用，功率不超过25瓦；B类证书可使用所有业余频段，30MHz以下不超过15瓦，以上不超过25瓦；C类证书为最高级，30MHz以下功率可达1000瓦。"
        }
      },
      {
        "@type": "Question",
        "name": "业余无线电考试考什么内容？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "考试内容涵盖无线电管理法规、频率管理、呼号管理、操作证书规定、通信基础、通信礼仪、电波传播、天线基础、电路基础、电磁兼容、安全用电等12个知识领域。"
        }
      },
      {
        "@type": "Question",
        "name": "A类考试有多少道题？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A类考试共40题，其中单选题32题，多选题8题，考试时间40分钟，答对30题及以上即为合格。"
        }
      },
      {
        "@type": "Question",
        "name": "如何高效备考业余无线电考试？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "建议使用业余无线电学习平台进行系统性练习：通过刷题练习模式逐题掌握知识点，利用模拟考试检验学习效果，通过错题本功能针对性强化薄弱环节，收藏重点题目反复复习。"
        }
      }
    ]
  };

  useStructuredData([{ type: "faq", data: faqData }]);
};