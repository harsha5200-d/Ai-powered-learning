import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { Brain, Zap, BarChart2, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

// ── Three.js Interactive Background ──────────────────────
function InteractiveCanvas() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        const W = mount.clientWidth;
        const H = mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        // Remove fog to ensure crisp visibility all the way to the back
        // scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);

        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
        camera.position.z = 40;

        // Lights - Maximized for perfect visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Very bright ambient
        scene.add(ambientLight);
        
        // Hemisphere light to remove any dark shadows underneath
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        // Strong directional light pointing from the front right
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(20, 30, 40);
        scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0x6080ff, 3, 100);
        pointLight1.position.set(20, 20, 20);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xd946ef, 3, 100);
        pointLight2.position.set(-20, -20, 20);
        scene.add(pointLight2);

        // Group to hold all interactive meshes
        const meshesGroup = new THREE.Group();
        scene.add(meshesGroup);

        // Materials - Very low roughness, high brightness
        const brandMaterial = new THREE.MeshStandardMaterial({
            color: 0x6080ff,
            roughness: 0.1,
            metalness: 0.1,
            transparent: false // Make solid for maximum visibility
        });
        
        const purpleMaterial = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            roughness: 0.1,
            metalness: 0.1,
            transparent: false
        });

        const pinkMaterial = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            roughness: 0.1,
            metalness: 0.1,
            transparent: false
        });
        
        const paperMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Pure white
            roughness: 0.2,
            metalness: 0.0,
            transparent: false
        });

        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            roughness: 0.1,
            metalness: 0.3,
            transparent: false
        });
        
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });

        // Add distinct relatable shapes
        const shapes = [];

        // 1. A 3D Book
        const bookGroup = new THREE.Group();
        const coverGeo = new THREE.BoxGeometry(7, 9, 1.5);
        const pagesGeo = new THREE.BoxGeometry(6.5, 8.5, 1.6);
        const coverMesh = new THREE.Mesh(coverGeo, brandMaterial);
        const pagesMesh = new THREE.Mesh(pagesGeo, paperMaterial);
        pagesMesh.position.x = 0.25; // Offset to mimic binding
        bookGroup.add(coverMesh);
        bookGroup.add(pagesMesh);
        bookGroup.position.set(-16, 6, -10);
        bookGroup.rotation.set(0.5, 0.5, -0.2);
        shapes.push({ mesh: bookGroup, speedX: 0.003, speedY: 0.005 });
        meshesGroup.add(bookGroup);

        // 2. A 3D "Document" or Paper Stack
        const docGroup = new THREE.Group();
        const paperGeo = new THREE.BoxGeometry(6, 8, 0.1);
        for(let i=0; i<3; i++) {
            const paper = new THREE.Mesh(paperGeo, i===0 ? purpleMaterial : paperMaterial);
            paper.position.set(i*0.2, i*0.2, i*0.2);
            paper.rotation.z = i * 0.1;
            docGroup.add(paper);
        }
        docGroup.position.set(16, 2, -15);
        docGroup.rotation.set(-0.3, -0.4, 0.1);
        shapes.push({ mesh: docGroup, speedX: -0.003, speedY: -0.004 });
        meshesGroup.add(docGroup);

        // 3. A 3D Pencil
        const pencilGroup = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 6);
        const tipGeo = new THREE.ConeGeometry(0.5, 1.5, 6);
        const leadGeo = new THREE.ConeGeometry(0.2, 0.6, 6);
        const bodyMesh = new THREE.Mesh(bodyGeo, goldMaterial);
        const tipMesh = new THREE.Mesh(tipGeo, pinkMaterial); // Wood tip color roughly
        const leadMesh = new THREE.Mesh(leadGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
        tipMesh.position.y = -3.75;
        tipMesh.rotation.z = Math.PI;
        leadMesh.position.y = -4.2;
        leadMesh.rotation.z = Math.PI;
        pencilGroup.add(bodyMesh);
        pencilGroup.add(tipMesh);
        pencilGroup.add(leadMesh);
        pencilGroup.position.set(8, -10, -5);
        pencilGroup.rotation.set(0.5, 0, 0.8);
        shapes.push({ mesh: pencilGroup, speedX: 0.006, speedY: -0.002 });
        meshesGroup.add(pencilGroup);
        
        // 4. Floating "Notes" (Lined paper representing notes)
        const noteGeo = new THREE.BoxGeometry(4, 4, 0.1);
        const lineGeo = new THREE.BoxGeometry(3, 0.05, 0.12);
        
        for (let i = 0; i < 4; i++) {
            const noteGroup = new THREE.Group();
            const noteMesh = new THREE.Mesh(noteGeo, paperMaterial);
            noteGroup.add(noteMesh);
            
            // Add lines to the note to make it look like written notes
            for(let j=0; j<4; j++) {
                const line = new THREE.Mesh(lineGeo, lineMaterial);
                line.position.set(0, 1 - j*0.6, 0);
                noteGroup.add(line);
            }
            
            noteGroup.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30 - 15
            );
            noteGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            shapes.push({ 
                mesh: noteGroup, 
                speedX: (Math.random() - 0.5) * 0.01 + 0.005, 
                speedY: (Math.random() - 0.5) * 0.01 + 0.005
            });
            meshesGroup.add(noteGroup);
        }

        // 5. Floating abstract particles (knowledge nodes) in background
        const nodeGeo = new THREE.SphereGeometry(0.4, 16, 16);
        for (let i = 0; i < 15; i++) {
            const material = [brandMaterial, purpleMaterial, pinkMaterial][i % 3];
            const node = new THREE.Mesh(nodeGeo, material);
            node.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40 - 20
            );
            shapes.push({ 
                mesh: node, 
                speedX: (Math.random() - 0.5) * 0.01, 
                speedY: (Math.random() - 0.5) * 0.01 
            });
            meshesGroup.add(node);
        }

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const windowHalfX = W / 2;
        const windowHalfY = H / 2;

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        };
        document.addEventListener('mousemove', onDocumentMouseMove);

        // Animate
        let animId;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            // Smoothly move the entire group based on mouse
            meshesGroup.rotation.y += 0.05 * (targetX - meshesGroup.rotation.y);
            meshesGroup.rotation.x += 0.05 * (targetY - meshesGroup.rotation.x);

            // Rotate individual shapes
            shapes.forEach(shape => {
                shape.mesh.rotation.x += shape.speedX;
                shape.mesh.rotation.y += shape.speedY;
                
                // Gentle floating up and down
                shape.mesh.position.y += Math.sin(Date.now() * 0.001 + shape.mesh.position.x) * 0.02;
            });

            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const onResize = () => {
            const nW = mount.clientWidth;
            const nH = mount.clientHeight;
            camera.aspect = nW / nH;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, nH);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId);
            document.removeEventListener('mousemove', onDocumentMouseMove);
            window.removeEventListener("resize", onResize);
            
            // Cleanup geometries and materials
            shapes.forEach(shape => {
                shape.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            });
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden" style={{ pointerEvents: 'none' }} />;
}

// ── Feature Cards ──────────────────────────────────────
const FEATURES = [
    {
        icon: Brain,
        title: "AI-Generated Quizzes",
        desc: "Upload any PDF and instantly get 10 smart MCQs powered by Gemini AI.",
        color: "text-brand-400",
        bg: "bg-brand-500/10",
    },
    {
        icon: BookOpen,
        title: "Smart Study Notes",
        desc: "Auto-summarize your documents into concise, readable study notes.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        icon: BarChart2,
        title: "Performance Analytics",
        desc: "Track accuracy, improvement trends, and weak areas with rich charts.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        icon: Zap,
        title: "Instant Feedback",
        desc: "Get per-question feedback after every quiz attempt with correct answers.",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
    },
];

const BENEFITS = [
    "Upload PDFs up to 10 MB",
    "Gemini-powered question generation",
    "Full quiz attempt history",
    "Accuracy & trend analytics",
    "Secure JWT authentication",
    "Mobile-friendly interface",
];

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* ── Hero ────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <InteractiveCanvas />
                {/* Gradient overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-surface/50 to-surface pointer-events-none" />

                <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-24 pb-20 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-sm font-medium mb-8">
                        <Zap size={14} className="fill-current" />
                        AI-Powered Study Platform
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                        <span className="text-white">Study Smarter</span>
                        <br />
                        <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            with AI Assistance
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Upload your study materials and let StudyQ automatically generate quizzes,
                        notes, and analytics to supercharge your learning.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-base px-8 py-3">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn-secondary text-base px-8 py-3">
                            Sign In
                        </Link>
                    </div>

                    {/* Scroll cue */}
                    <div className="mt-20 flex flex-col items-center gap-1 text-slate-600 text-xs animate-bounce">
                        <span>Scroll to explore</span>
                        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                            <path d="M7 1v16M1 11l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────── */}
            <section className="py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything you need to excel</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            StudyQ turns passive reading into active learning with AI-driven tools.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                            <div key={title} className="card hover:border-brand-500/30 transition-colors group">
                                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                                    <Icon size={22} className={color} />
                                </div>
                                <h3 className="font-semibold text-white mb-2">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Benefits list ───────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 bg-surface-100 border-y border-surface-300">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-10">Everything included, free</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {BENEFITS.map((b) => (
                            <div key={b} className="flex items-center gap-2 text-slate-300 text-sm">
                                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                                {b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA bottom ──────────────────────────────────── */}
            <section className="py-28 px-4 sm:px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to study smarter?</h2>
                    <p className="text-slate-400 mb-10">
                        Join thousands of students using StudyQ to ace their exams.
                    </p>
                    <Link to="/register" className="btn-primary text-base px-10 py-3">
                        Create Free Account <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-surface-300 py-8 text-center text-slate-600 text-sm">
                © 2026 StudyQ. Built with ❤️ using React, Flask & Gemini AI.
            </footer>
        </div>
    );
}
