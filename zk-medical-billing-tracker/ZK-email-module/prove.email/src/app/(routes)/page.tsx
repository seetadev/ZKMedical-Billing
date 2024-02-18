import ApplicationSection from "@/components/ApplicationSection/ApplicationSection";
import BuildYourOwn from "@/components/BuildYourOwn";
import ContributeSection from "@/components/ContributeSection/ContributeSection";
import HeroSection from "@/components/HeroSection/HeroSection";
import PartnerForm from "@/components/partnerSection/partnerForm";

const HomePage = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ApplicationSection />
      <BuildYourOwn />
      <PartnerForm />  
      <ContributeSection />
    </div>
  );
};

export default HomePage;
