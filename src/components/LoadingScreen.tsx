import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 2000); // Step 1 for 2 seconds
    const timer2 = setTimeout(() => setCurrentStep(3), 4000); // Step 2 for 2 seconds
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const renderStep1 = () => (
    <>
      <div className="loading-content">
        <h1 className="loading-main-title">
          Making Sense<br />
          Technology for smarter<br />
          investments.
        </h1>

        <div className="loading-divider">
          <div className="divider-line"></div>
          <svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="divider-dot">
            <circle cx="2.5" cy="2" r="2" fill="url(#paint0_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="0.5" y1="2" x2="4.5" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ECC7E"/>
                <stop offset="1" stopColor="#53C0D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="loading-features">
          <div className="feature-item">
            <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3.5" cy="4" r="3.5" fill="url(#paint0_linear_feature)"/>
              <defs>
                <linearGradient id="paint0_linear_feature" x1="0.330301" y1="3.07772" x2="2.83856" y2="5.7951" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1EDD8E"/>
                  <stop offset="1" stopColor="#53C0D2"/>
                </linearGradient>
              </defs>
            </svg>
            <span>20+ years driving digital innovation</span>
          </div>
          <div className="feature-item">
            <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3.5" cy="4" r="3.5" fill="url(#paint0_linear_feature2)"/>
              <defs>
                <linearGradient id="paint0_linear_feature2" x1="0.330301" y1="3.07772" x2="2.83856" y2="5.7951" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1EDD8E"/>
                  <stop offset="1" stopColor="#53C0D2"/>
                </linearGradient>
              </defs>
            </svg>
            <span>100+ successful projects</span>
          </div>
          <div className="feature-item">
            <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3.5" cy="4" r="3.5" fill="url(#paint0_linear_feature3)"/>
              <defs>
                <linearGradient id="paint0_linear_feature3" x1="0.330301" y1="3.07772" x2="2.83856" y2="5.7951" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1EDD8E"/>
                  <stop offset="1" stopColor="#53C0D2"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Expertise in Private Equity & Portfolio Companies</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="loading-content">
        <h1 className="loading-main-title">
          Making Sense<br />
          Technology for smarter<br />
          investments.
        </h1>

        <div className="loading-divider">
          <div className="divider-line"></div>
          <svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="divider-dot">
            <circle cx="2.5" cy="2" r="2" fill="url(#paint0_linear_step2)"/>
            <defs>
              <linearGradient id="paint0_linear_step2" x1="0.5" y1="2" x2="4.5" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ECC7E"/>
                <stop offset="1" stopColor="#53C0D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="loading-description-section">
          <h2 className="loading-subtitle">From Due Diligence to Value Creation.</h2>
          <p className="loading-description">
            We help Private Equity firms and their portfolio companies maximize ROI and accelerate growth through technology.
          </p>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="loading-content">
        <h1 className="loading-main-title">
          Making Sense<br />
          Technology for smarter<br />
          investments.
        </h1>

        <div className="loading-divider">
          <div className="divider-line"></div>
          <svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="divider-dot">
            <circle cx="2.5" cy="2" r="2" fill="url(#paint0_linear_step3)"/>
            <defs>
              <linearGradient id="paint0_linear_step3" x1="0.5" y1="2" x2="4.5" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ECC7E"/>
                <stop offset="1" stopColor="#53C0D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="loading-services-section">
          <h2 className="loading-subtitle">How We Help?</h2>
          
          <div className="services-carousel">
            <div className="service-card">
              <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.6727 24.7827C29.6727 21.6592 27.1426 19.1177 24.033 19.1177C20.9234 19.1177 18.3932 21.6592 18.3932 24.7827C18.3932 27.9062 20.9234 30.4455 24.033 30.4455C25.0688 30.4455 26.0388 30.162 26.873 29.6716L29.4159 33.0104C29.5539 33.1917 29.7619 33.2876 29.9721 33.2876C30.1206 33.2876 30.2692 33.2407 30.3966 33.1426C30.7044 32.906 30.7616 32.4646 30.5282 32.1576L27.9853 28.8166C29.0254 27.789 29.6727 26.3605 29.6727 24.7827ZM19.7962 24.7827C19.7962 22.4353 21.6981 20.5249 24.0351 20.5249C26.3721 20.5249 28.274 22.4353 28.274 24.7827C28.274 27.1301 26.3721 29.0405 24.0351 29.0405C21.6981 29.0405 19.7962 27.1301 19.7962 24.7827ZM14.1523 34.0061V18.4035C14.1523 17.2308 15.1032 16.2757 16.2706 16.2757H19.0937V14.1478C19.0937 12.9752 20.0446 12.02 21.2121 12.02H31.8017C32.9692 12.02 33.9201 12.9752 33.9201 14.1478V35.4218C33.9201 36.5945 32.9692 37.5497 31.8017 37.5497H17.6843C17.2937 37.5497 16.9775 37.232 16.9775 36.8397C16.9775 36.4474 17.2937 36.1297 17.6843 36.1297H31.8017C32.1902 36.1297 32.5086 35.812 32.5086 35.4197V14.15C32.5086 13.7598 32.1923 13.44 31.8038 13.44H21.2142C20.8257 13.44 20.5073 13.7577 20.5073 14.15V16.2778C20.5073 17.0603 19.8748 17.6956 19.0958 17.6956H16.2727C15.8843 17.6956 15.5659 18.0133 15.5659 18.4056V34.0083C15.5659 34.4006 15.2496 34.7182 14.8591 34.7182C14.4685 34.7182 14.1523 34.4006 14.1523 34.0083V34.0061ZM14.3093 37.394C14.1629 37.2469 14.0801 37.0465 14.0801 36.8418C14.0801 36.7928 14.0843 36.7395 14.095 36.6904C14.1077 36.6414 14.1204 36.5902 14.1395 36.5433C14.1607 36.4964 14.1841 36.4516 14.2117 36.409C14.2393 36.3663 14.2711 36.3258 14.3072 36.2917C14.5938 36.0018 15.1159 36.0018 15.4046 36.2917C15.4428 36.328 15.4725 36.3685 15.5001 36.409C15.5277 36.4516 15.5532 36.4964 15.5723 36.5433C15.5914 36.5902 15.6062 36.6393 15.6168 36.6904C15.6253 36.7395 15.6317 36.7928 15.6317 36.8418C15.6317 37.0465 15.5489 37.249 15.4025 37.394C15.3664 37.4303 15.3282 37.4622 15.2857 37.49C15.2433 37.5177 15.1987 37.5411 15.152 37.5603C15.1053 37.5795 15.0586 37.5966 15.0077 37.6051C14.9567 37.6136 14.9058 37.62 14.8549 37.62C14.8039 37.62 14.7529 37.6158 14.7041 37.6051C14.6553 37.5944 14.6044 37.5795 14.5577 37.5603C14.511 37.5411 14.4664 37.5177 14.424 37.49C14.3815 37.4622 14.3412 37.4281 14.3072 37.394H14.3093Z" fill="url(#paint0_linear_tech_dd)"/>
                <defs>
                  <linearGradient id="paint0_linear_tech_dd" x1="17.1303" y1="17.0304" x2="33.6004" y2="36.5627" gradientUnits="userSpaceOnUse">
                    <stop offset="0.22" stopColor="#00CB78"/>
                    <stop offset="0.83" stopColor="#00C3D0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Technology Due Diligence</span>
            </div>

            <div className="service-card">
              <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34.2703 16.8202H27.8932V15.8218C27.8932 14.7849 27.0483 13.94 26.0114 13.94H21.1961C20.1592 13.94 19.3164 14.7828 19.3164 15.8196V16.8181H12.9394C11.9025 16.8181 11.0598 17.6609 11.0598 18.6978V22.7877C11.0598 23.2123 11.4054 23.56 11.8321 23.56C12.2588 23.56 12.6044 23.2144 12.6044 22.7877V18.6978C12.6044 18.5121 12.7559 18.3607 12.9415 18.3607H34.2724C34.458 18.3607 34.6095 18.5121 34.6095 18.6978V32.6893C34.6095 32.8749 34.458 33.0264 34.2724 33.0264H12.9415C12.7559 33.0264 12.6044 32.8749 12.6044 32.6893V28.2922C12.6044 27.8676 12.2588 27.5198 11.8321 27.5198C11.4054 27.5198 11.0598 27.8655 11.0598 28.2922V32.6872C11.0598 33.7241 11.9046 34.569 12.9415 34.569H34.2724C35.3093 34.569 36.152 33.7262 36.152 32.6893V18.6978C36.152 17.6609 35.3072 16.816 34.2703 16.816V16.8202ZM26.3507 16.8202H20.859V15.8218C20.859 15.6362 21.0105 15.4847 21.1961 15.4847H26.0136C26.1992 15.4847 26.3507 15.6362 26.3507 15.8218V16.8202ZM11.5377 26.2653C11.5846 26.2845 11.6337 26.2995 11.6806 26.3101C11.7318 26.3187 11.7809 26.3251 11.8299 26.3251C12.0326 26.3251 12.2311 26.244 12.374 26.101C12.517 25.9581 12.6001 25.7576 12.6001 25.5549C12.6001 25.4994 12.5938 25.4482 12.5831 25.3991C12.5746 25.3522 12.5575 25.301 12.5383 25.2562C12.5212 25.2156 12.4977 25.1687 12.47 25.1282C12.4423 25.0855 12.4103 25.0471 12.374 25.0108C12.2353 24.8721 12.0369 24.7932 11.8278 24.7932C11.6187 24.7932 11.4203 24.8721 11.2816 25.0108C11.1387 25.1559 11.0576 25.3543 11.0576 25.5549C11.0576 25.7554 11.1387 25.956 11.2816 26.101C11.3179 26.1352 11.3563 26.1693 11.4054 26.1992C11.4374 26.2227 11.4843 26.2461 11.5377 26.2675V26.2653Z" fill="url(#paint0_linear_post_ma)"/>
                <defs>
                  <linearGradient id="paint0_linear_post_ma" x1="11.1856" y1="20.1869" x2="34.1209" y2="30.3638" gradientUnits="userSpaceOnUse">
                    <stop offset="0.22" stopColor="#00CB78"/>
                    <stop offset="0.83" stopColor="#00C3D0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Post-M&A Integrations</span>
            </div>

            <div className="service-card">
              <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.202 26.9487C25.3431 27.0888 25.4266 27.282 25.4266 27.4815C25.4266 27.681 25.3431 27.8741 25.202 28.0163C25.0608 28.1564 24.8661 28.2349 24.665 28.2349C24.4639 28.2349 24.2693 28.1543 24.1259 28.0163C23.9847 27.8741 23.9056 27.6789 23.9056 27.4815C23.9056 27.2841 23.9869 27.0888 24.1259 26.9487C24.4104 26.6665 24.9196 26.6665 25.202 26.9487ZM37.1174 27.8253C37.1174 30.2852 35.1001 32.2867 32.6208 32.2867H18.4378C14.6235 32.2867 11.5195 29.2091 11.5195 25.4227C11.5195 21.6363 14.6235 18.5588 18.4378 18.5588C18.7137 18.5588 18.9918 18.5757 19.2721 18.6097C20.7481 17.2471 22.6563 16.5 24.6864 16.5C28.7338 16.5 32.0688 19.4608 32.5737 23.3661C35.0809 23.3427 37.1195 25.3505 37.1195 27.8274L37.1174 27.8253ZM35.7333 27.8253C35.7333 26.1231 34.3364 24.7372 32.6208 24.7372C32.4432 24.7372 32.2614 24.7541 32.0646 24.7902C31.8678 24.8263 31.6645 24.7754 31.5084 24.6501C31.3522 24.5249 31.2581 24.3403 31.2495 24.1408C31.1147 20.626 28.2311 17.8732 24.6843 17.8732C23.328 17.8732 22.0381 18.2765 20.9492 19.0278C22.8018 19.7431 24.2842 21.233 24.9624 23.1368C25.1378 23.6293 25.2576 24.1429 25.3153 24.6629C25.3581 25.0407 25.0843 25.3781 24.7035 25.4206C24.3249 25.463 23.9826 25.1914 23.9398 24.8136C23.8928 24.3976 23.7986 23.988 23.6574 23.5932C22.9921 21.7276 21.3599 20.3565 19.4004 20.0169C19.394 20.0169 19.3876 20.0169 19.3833 20.0148C19.0667 19.9617 18.7501 19.9341 18.4399 19.9341C15.3872 19.9341 12.9036 22.3982 12.9036 25.427C12.9036 28.4557 15.3872 30.9198 18.4399 30.9198H32.6229C34.3385 30.9198 35.7355 29.5317 35.7355 27.8296L35.7333 27.8253Z" fill="url(#paint0_linear_cloud)"/>
                <defs>
                  <linearGradient id="paint0_linear_cloud" x1="13.2138" y1="20.6345" x2="36.5187" y2="31.148" gradientUnits="userSpaceOnUse">
                    <stop offset="0.22" stopColor="#00CB78"/>
                    <stop offset="0.83" stopColor="#00C3D0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Cloud Migration & Modernization</span>
            </div>
          </div>

          <div className="carousel-indicators">
            <div className="indicator active"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="loading-screen">
      <div className="loading-section">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="loading-spinner">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clipPath)">
              <g transform="matrix(0.028 0 0 0.028 28 28)">
                <foreignObject x="-1035.71" y="-1035.71" width="2071.43" height="2071.43">
                  <div
                    style={{
                      background: 'conic-gradient(from 90deg, rgba(14, 204, 126, 1) 0deg, rgba(83, 192, 210, 0) 360deg)',
                      height: '100%',
                      width: '100%',
                      opacity: 1,
                    }}
                  />
                </foreignObject>
              </g>
            </g>
            <path d="M56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28ZM8.4 28C8.4 38.8248 17.1752 47.6 28 47.6C38.8248 47.6 47.6 38.8248 47.6 28C47.6 17.1752 38.8248 8.4 28 8.4C17.1752 8.4 8.4 17.1752 8.4 28Z" fill="url(#spinnerGradient)"/>
            <defs>
              <clipPath id="clipPath">
                <path d="M56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28ZM8.4 28C8.4 38.8248 17.1752 47.6 28 47.6C38.8248 47.6 47.6 38.8248 47.6 28C47.6 17.1752 38.8248 8.4 28 8.4C17.1752 8.4 8.4 17.1752 8.4 28Z"/>
              </clipPath>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ECC7E" stopOpacity="1"/>
                <stop offset="100%" stopColor="#53C0D2" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
