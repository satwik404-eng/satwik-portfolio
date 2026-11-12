'use client';

import { useState } from 'react';
import { projects, semesters, skills } from '../lib/learning';
import { Icon } from './icons';

const years = [...new Set(semesters.map((term) => term.academicYear))];
const number = (value: number) => String(value).padStart(2, '0');

export function LearningJourney() {
  const [selected, setSelected] = useState(semesters.find((term) => term.status === 'Current')?.semester ?? semesters[0]?.semester);
  const term = semesters.find((item) => item.semester === selected);
  const related = projects.filter((project) => term?.projectIds?.includes(project.id));
  const unassigned = projects.filter((project) => project.semester === null);
  const learned = skills.filter((skill) => term?.skillsLearned?.includes(skill.id));

  return (
    <div className="journey-explorer">
      <div className="semester-years" role="group" aria-label="Choose a semester" data-reveal>
        <span className="journey-progress" aria-hidden="true" />
        {years.map((year) => (
          <div className="semester-year" key={year}>
            <span className="year-number"><small>Year</small> {number(year)}</span>
            <div className="semester-options">
              {semesters.filter((item) => item.academicYear === year).map((item) => (
                <button type="button" key={item.semester} className="semester-option" aria-pressed={item.semester === selected} aria-controls="semester-detail" onClick={() => setSelected(item.semester)}>
                  <span>Semester {number(item.semester)}</span>
                  <small>{item.status}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="semester-detail" id="semester-detail" aria-live="polite">
        {term && <div key={term.semester} className="semester-content">
          <div className="semester-intro">
            <div>
              <p className="eyebrow">{term.period ?? 'Year ' + number(term.academicYear)} · {term.status}</p>
              <h3>Semester {number(term.semester)}{term.title && ' — ' + term.title}</h3>
            </div>
            {term.description && <p className="body-text">{term.description}</p>}
          </div>
          {term.status === 'Planned' ? <p className="body-text semester-future">Coursework, skills, and projects will be added when this semester begins.</p> :
            <div className="semester-grid">
              <div>
                {term.courses?.length ? <section className="semester-section"><h4>Coursework and practice</h4><ul>{term.courses.map((course) => <li key={course}>{course}</li>)}</ul></section> : null}
                {term.milestones?.length ? <section className="semester-section"><h4>Milestones</h4><ul>{term.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ul></section> : null}
                {related.length ? (
                  <section className="semester-section">
                    <h4>Projects from this semester</h4>
                    <ul className="semester-projects">
                      {related.map((project) => <li key={project.id}><a href={'#card-' + project.slug}><span>{project.title}</span><Icon name="up-right" size={16} /></a></li>)}
                    </ul>
                  </section>
                ) : null}
              </div>
              {learned.length > 0 && <section className="semester-section semester-skill-list">
                <h4>Skills documented this semester</h4>
                <ul>{learned.map((skill) => (
                  <li key={skill.id}>
                    <div><strong>{skill.name}</strong><span>{skill.category}</span></div>
                    <p>{skill.description}</p>
                    <small>{skill.evidence}</small>
                  </li>
                ))}</ul>
              </section>}
            </div>}
        </div>}
      </div>
      {unassigned.length > 0 && <section className="semester-section unassigned-projects">
        <h3>Undated projects</h3>
        <ul className="semester-projects">{unassigned.map((project) => <li key={project.id}><a href={'#card-' + project.slug}>{project.title}<Icon name="up-right" size={16} /></a></li>)}</ul>
      </section>}
    </div>
  );
}
