import { certificates, skills } from '../lib/learning';
import { Icon } from './icons';

const categories = [...new Set(skills.map((skill) => skill.category))];

export function PortfolioSkills() {
  return (
    <div className="skills-list">
      {categories.map((category) => {
        const group = skills.filter((skill) => skill.category === category);
        return (
          <details className="skill-row" data-reveal key={category}>
            <summary>
              <span><strong>{category}</strong><small>{group.map(({ name }) => name).join(' · ')}</small></span>
              <Icon name="down" size={16} />
            </summary>
            <dl className="skill-evidence">{group.map((skill) => (
              <div key={skill.id}><dt>{skill.name}</dt><dd>{skill.description}</dd><dd className="skill-source">{skill.evidence}</dd></div>
            ))}</dl>
          </details>
        );
      })}
      <section className="credentials" id="certifications" aria-labelledby="credentials-title" data-reveal>
        <h3 id="credentials-title">Certifications</h3>
        <ul>
          {certificates.map((certificate) => (
            <li key={certificate.title}>
              <div><h4>{certificate.title}</h4><p>{certificate.issuer} · <time dateTime={certificate.issued}>{certificate.dateLabel}</time></p><p>{certificate.detail}</p></div>
              <a className="text-link" href={certificate.document} target="_blank" rel="noopener noreferrer" aria-label={'View ' + certificate.title + ' certificate'}>View certificate <Icon name="up-right" size={15} /></a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
