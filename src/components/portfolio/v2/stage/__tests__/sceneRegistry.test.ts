import { PAGE_ORDER } from '../../shared/useComplexTransition';

describe('Scene registry', () => {
  it('has one scene per page in PAGE_ORDER', () => {
    expect(PAGE_ORDER).toEqual(['Main', 'About', 'Skill', 'Projects', 'Contact']);
  });

  it('exposes scene modules importable by id', async () => {
    const SCENE_FILE: Record<string, string> = {
      Main: 'MainScene',
      About: 'AboutScene',
      Skill: 'SkillsScene',
      Projects: 'ProjectsScene',
      Contact: 'ContactScene',
    };

    for (const id of PAGE_ORDER) {
      const mod = await import(`../scenes/${SCENE_FILE[id]}`);
      expect(mod.default).toBeDefined();
    }
  });
});
