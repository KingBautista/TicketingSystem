import React from 'react';

export default function About() {
  return (
    <div className="container-fluid">
      {/* Company Branding */}
      <div className="text-center mb-4">
        <div className="mb-3">
          <img 
            src="/assets/img/hitec-logo.png" 
            alt="HITEC Logo" 
            className="img-fluid"
            style={{ maxWidth: '150px', height: 'auto' }}
          />
        </div>
      </div>

      {/* Get in Touch Section */}
      <div className="text-center mb-4">
        <h3 className="h5 mb-2 fw-bold text-dark">Get in Touch with Us!</h3>
        <p className="text-muted mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Have questions or need assistance? Our team is here to help! Feel free to reach out via phone or email, and we'll get back to you as soon as possible.
        </p>
        
        {/* Main Contact Information */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <div className="row g-4">
              {/* Left Column */}
              <div className="col-md-8">
                <div className="d-flex align-items-start mb-3">
                  <img 
                    src="/assets/new-icons/icons-bold/fi-br-call-outgoing.svg" 
                    alt="Phone" 
                    className="me-3 mt-1" 
                    style={{ width: '1.2rem', height: '1.2rem', color: '#0d6efd' }}
                  />
                  <div>
                    <div className="fw-medium">+(632) 8724-0191 / +(632) 8724-0193</div>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <img 
                    src="/assets/new-icons/icons-bold/fi-br-building.svg" 
                    alt="Building" 
                    className="me-3 mt-1" 
                    style={{ width: '1.2rem', height: '1.2rem', color: '#0d6efd' }}
                  />
                  <div className="text-start">
                    <div className="fw-medium">1401 Annapolis Wilshire Plaza Building,</div>
                    <div className="fw-medium">11 Annapolis St., Greenhills, San Juan, Metro Manila, Philippines</div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="col-md-4">
                <div className="d-flex align-items-start mb-3">
                  <img 
                    src="/assets/new-icons/icons-bold/fi-br-envelope.svg" 
                    alt="Email" 
                    className="me-3 mt-1" 
                    style={{ width: '1.2rem', height: '1.2rem', color: '#0d6efd' }}
                  />
                  <div>
                    <div className="fw-medium">info@hitec.com.ph</div>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <img 
                    src="/assets/new-icons/icons-bold/fi-br-globe.svg" 
                    alt="Website" 
                    className="me-3 mt-1" 
                    style={{ width: '1.2rem', height: '1.2rem', color: '#0d6efd' }}
                  />
                  <div>
                    <div className="fw-medium">www.hitec.com.ph</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <hr className="my-4" />

      {/* Additional Information */}
      <div className="row g-4">
        {/* Troy L. Mendoza */}
        <div className="col-md-4">
          <div className="text-center">
            <div className="fw-bold mb-1">Troy L. Mendoza</div>
            <div className="text-muted mb-3">Business Development Manager</div>
            <div className="d-flex align-items-center justify-content-center mb-2">
              <img 
                src="/assets/new-icons/icons-bold/fi-br-envelope.svg" 
                alt="Email" 
                className="me-2" 
                style={{ width: '1rem', height: '1rem', color: '#0d6efd' }}
              />
              <div className="text-start">
                <div className="small text-muted">Email: tmendoza@elid.com.ph</div>
                <div className="small text-muted">Mobile: 0917-7312212 / 0998-8651195</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Support */}
        <div className="col-md-4">
          <div className="text-center">
            <div className="fw-bold mb-3">Service Support</div>
            <div className="d-flex align-items-center justify-content-center mb-2">
              <img 
                src="/assets/new-icons/icons-bold/fi-br-call-outgoing.svg" 
                alt="Phone" 
                className="me-2" 
                style={{ width: '1rem', height: '1rem', color: '#0d6efd' }}
              />
              <div className="text-start">
                <div className="small text-muted">+63 998 992 0302</div>
                <div className="small text-muted">+63 998 865 1225</div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="col-md-4">
          <div className="text-center">
            <div className="fw-bold mb-3">Office Hours</div>
            <div className="d-flex align-items-center justify-content-center mb-2">
              <img 
                src="/assets/new-icons/icons-bold/fi-br-clock.svg" 
                alt="Clock" 
                className="me-2" 
                style={{ width: '1rem', height: '1rem', color: '#0d6efd' }}
              />
              <div className="text-start">
                <div className="small text-muted">Monday to Thursday | Friday</div>
                <div className="small text-muted">8:00AM to 6:30PM</div>
                <div className="small text-muted">8:00AM to 5:00PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
