import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import memberConfig from '../../members.config';
import scheduleConfig from '../../schedule.config';
import styles from './index.module.css';

const members = memberConfig.map((m) => ({
  name: m.githubId,
  avatar: `https://github.com/${m.githubId}.png`,
  docsPath: `/claude-code-master-reading/docs/${m.dir}/${m.firstDoc}`,
}));

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
              {scheduleConfig.map((s, i) => (
                <tr key={i}>
                  <td>{s.date}</td>
                  <td>{s.part}</td>
                  <td>{s.title}</td>
                  <td>{s.done ? '✅' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </Layout>
  );
}
