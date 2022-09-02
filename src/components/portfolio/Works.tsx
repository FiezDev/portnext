import { PROJECT_STATUS, PROJECT_TYPE } from '@/model/enum';
import { Projects } from '@/model/object';
import { ImgixImage } from '@/model/storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Heading from '../global/Heading';
import ProjectCard from '../global/ProjectCard';

const Works: React.FC = () => {
  const [project, SetProject] = useState();
  const collec = 'Projects';
  useEffect(() => {
    axios
      .get(`https://www.fiez.dev/api/fireStoreGetAll?collections=${collec}`)
      .then((response) => {
        SetProject(response.data);
        console.log(project);
      });
  }, []);

  const _projects: Projects = [
    {
      projectID: 1,
      projectType: PROJECT_TYPE.Work,
      projectName: 'Short URL Service Website',
      projectFullName: '',
      projectIntro: 'Short URL Service Website',
      projectDesc: (
        <p>
          - Work closely with ux/ui designer to implement Frontend/Backend of
          ADMIN Panel for company and corporate customer
        </p>
      ),
      projectPic: {
        picurl: {
          pic: ImgixImage.main_portfolio1,
          width: 360,
          height: 480,
        },
      },
      createDate: Date(),
      updateDate: '',
      activeFlag: true,
      status: PROJECT_STATUS.Finish,
      stack: ['VueJS', 'Vuetify', 'C#', 'MySQL'],
    },
    {
      projectID: 2,
      projectType: PROJECT_TYPE.Work,
      projectName: 'Health Insurance WebApp',
      projectFullName: '',
      projectIntro: 'Health Insurance WebApp',
      projectDesc: (
        <p>
          - Debug and maintain of Application - Correct UI and Responsive Bug
          <br />
          - Delivering New Feature like Authentication, Customer Report, Coupon
          Code
          <br />
          - Support Customer about application problem and feature
          <br />
        </p>
      ),
      projectPic: {
        picurl: {
          pic: ImgixImage.main_portfolio2,
          width: 360,
          height: 480,
        },
      },
      createDate: Date(),
      updateDate: '',
      activeFlag: true,
      status: PROJECT_STATUS.Finish,
      stack: ['AngularJS', 'Typescript', 'PrimeNG', 'C#', 'MySQL'],
    },
    {
      projectID: 3,
      projectType: PROJECT_TYPE.Work,
      projectName: 'Taxi Service App',
      projectFullName: '',
      projectIntro: 'Taxi Service App',
      projectDesc: (
        <p>
          - Add front-end feature of Navigation And Driver Review
          <br />
          - Build front-end widget and design by XD Across many aplication
          feature
          <br />
          - Add Driver/Car data CRUD to ADMIN Panel
          <br />
        </p>
      ),
      projectPic: {
        picurl: {
          pic: ImgixImage.main_portfolio3,
          width: 360,
          height: 480,
        },
      },
      createDate: Date(),
      updateDate: '',
      activeFlag: true,
      status: PROJECT_STATUS.Finish,
      stack: ['VueJS', 'Vuetify', 'Typescript', 'Flutter', 'C#', 'Firebase'],
    },
  ];

  return (
    <div className="container px-5 py-24 mx-auto flex flex-col items-center justify-center">
      <Heading className={'pb-16'} text={'Works'} />
      <div className="flex flex-wrap -m-4 items-center justify-evenly">
        {_projects.map(
          ({
            projectID,
            projectType,
            projectName,
            projectFullName,
            projectIntro,
            projectDesc,
            projectPic: { picurl },
            createDate,
            updateDate,
            activeFlag,
            status,
            stack,
          }) => (
            <ProjectCard
              key={projectID}
              projectID={projectID}
              projectType={projectType}
              projectName={projectName}
              projectDesc={projectDesc}
              projectPic={{
                picurl: {
                  pic: picurl.pic,
                  width: picurl.width,
                  height: picurl.height,
                },
              }}
              createDate={createDate}
              activeFlag={activeFlag}
              status={status}
              stack={stack}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Works;
