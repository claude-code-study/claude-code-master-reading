import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const members = [
  {
    name: 'sukyoungshin',
    avatar: 'https://github.com/sukyoungshin.png',
    docsPath: '/claude-code-master-reading/docs/sukyoung/Chapter1',
  },
  {
    name: 'mariaanepark',
    avatar: 'https://github.com/mariaanepark.png',
    docsPath: '/claude-code-master-reading/docs/hjpark/Chapter2',
  },
];

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>클로드 코드 스터디</h1>
          <p>
            <a
              href="https://product.kyobobook.co.kr/detail/S000219725328"
              target="_blank"
              rel="noopener noreferrer"
            >
              클로드 코드 마스터 책
            </a>
            을 읽고 실습까지 진행하는 스터디입니다.
          </p>
        </div>

        <section className={styles.members}>
          <h2>스터디 구성원</h2>
          <div className={styles.memberGrid}>
            {members.map((m) => (
              <Link key={m.name} to={m.docsPath} className={styles.memberCard}>
                <img src={m.avatar} alt={m.name} width={80} height={80} />
                <span>@{m.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.schedule}>
          <h2>스터디 일정</h2>
          <table>
            <thead>
              <tr>
                <th>일정</th>
                <th>챕터</th>
                <th>제목</th>
                <th>진행</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026.05.13</td>
                <td>1부. Chapter 1</td>
                <td>AI 시대의 개발자 패러다임</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>2026.05.13</td>
                <td>1부. Chapter 2</td>
                <td>클로드 코드 설치와 환경 구성</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>2026.05.20</td>
                <td>1부. Chapter 3</td>
                <td>AI와 함께하는 개발 방법론</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </Layout>
  );
}
