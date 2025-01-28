import { TypeAnimation } from 'react-type-animation';

const TextAnimateDemo = () => {
  return (
    <div className="flex justify-center items-center py-12 font-bold">
      <TypeAnimation
        sequence={[
          'Write Email',
          1000,
          'Write Youtube Script',
          1000,
          'Write a Blog',
          1000,
        ]}
        wrapper="span"
        speed={50}
        style={{
          fontSize: '2em',
          display: 'inline-block',
          textAlign: 'center',
          lineHeight: '1.5',
          color: 'hsl(var(--primary))' // Using primary color from site
        }}
        repeat={Infinity}
      />
    </div>
  );
};

export default TextAnimateDemo;