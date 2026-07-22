#!/usr/bin/env python3
import os
import sys
import json
import glob
from PIL import Image

def find_assets(root_dir):
    """
    Scans the workspace to locate the best candidate for the source app icon and splash screen.
    """
    exclude_dirs = {'node_modules', 'dist', 'build', 'ios', 'android', '.git', '.gradle', '.idea', 'ios_backup', 'app-screenshot-automation', 'Govt-Invoice-Ipfs'}
    
    square_pngs = []
    portrait_pngs = []

    print("🔍 Scanning workspace for source assets...")
    for root, dirs, files in os.walk(root_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if not file.lower().endswith('.png'):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with Image.open(file_path) as im:
                    width, height = im.size
                    lower_path = file_path.lower()
                    
                    # 1. Square candidates (icons)
                    if width == height and width >= 48:
                        # Skip generated target icons or xcassets contents to find a pure high-res source icon
                        if 'xcassets' in lower_path or 'appiconset' in lower_path or 'imageset' in lower_path or 'launchimage' in lower_path:
                            continue
                            
                        score = width # Prioritize larger sizes
                        
                        # Boost scores for ideal names/paths
                        if 'icon' in file.lower() or 'logo' in file.lower() or 'bi.png' in file.lower():
                            score += 5000
                        elif 'cbs' in file.lower():
                            score += 2000
                            
                        square_pngs.append((file_path, width, score))
                        
                    # 2. Portrait/splash candidates (height > width)
                    elif height > width and height >= 320:
                        score = height * width # Prioritize larger resolutions
                        
                        if 'launchimage' in lower_path or 'splash.imageset' in lower_path:
                            score += 10000000
                        elif 'splash' in file.lower() or 'launch' in file.lower() or 'screen' in file.lower():
                            score += 5000000
                            
                        portrait_pngs.append((file_path, width, height, score))
            except Exception:
                # Skip unreadable images
                continue

    # Sort candidates
    square_pngs.sort(key=lambda x: x[2], reverse=True)
    portrait_pngs.sort(key=lambda x: x[3], reverse=True)

    selected_icon = square_pngs[0][0] if square_pngs else None
    selected_splash = portrait_pngs[0][0] if portrait_pngs else None
    
    if selected_icon:
        print(f"🎯 Selected Source Icon: {os.path.relpath(square_pngs[0][0], root_dir)} ({square_pngs[0][1]}x{square_pngs[0][1]}px)")
    else:
        print("⚠️ No square PNG icon found in the workspace!")

    if selected_splash:
        print(f"🎯 Selected Source Splash: {os.path.relpath(portrait_pngs[0][0], root_dir)} ({portrait_pngs[0][1]}x{portrait_pngs[0][2]}px)")
    else:
        print("⚠️ No portrait PNG splash screen found in the workspace!")

    return square_pngs[0][0] if square_pngs else None, portrait_pngs[0][0] if portrait_pngs else None

def get_top_left_pixel_color(image_path):
    """
    Samples the top-left pixel color of an image to use as padding color.
    """
    try:
        with Image.open(image_path) as im:
            rgb_im = im.convert('RGB')
            color = rgb_im.getpixel((0, 0))
            return color
    except Exception as e:
        print(f"⚠️ Error sampling color: {e}. Defaulting to black.")
        return (0, 0, 0)

def generate_contents_json(target_dir, asset_type):
    """
    Generates Contents.json for Xcode asset catalogs if missing.
    """
    contents_path = os.path.join(target_dir, 'Contents.json')
    if os.path.exists(contents_path):
        return

    print(f"📝 Creating Contents.json for {asset_type}...")
    if asset_type == 'icon':
        data = {
          "images" : [
            {
              "filename" : "AppIcon-512@2x.png",
              "idiom" : "universal",
              "platform" : "ios",
              "size" : "1024x1024"
            }
          ],
          "info" : {
            "author" : "xcode",
            "version" : 1
          }
        }
    elif asset_type == 'splash':
        data = {
          "images" : [
            {
              "idiom" : "universal",
              "filename" : "splash-2732x2732-2.png",
              "scale" : "1x"
            },
            {
              "idiom" : "universal",
              "filename" : "splash-2732x2732-1.png",
              "scale" : "2x"
            },
            {
              "idiom" : "universal",
              "filename" : "splash-2732x2732.png",
              "scale" : "3x"
            }
          ],
          "info" : {
            "version" : 1,
            "author" : "xcode"
          }
        }
    else:
        return

    os.makedirs(target_dir, exist_ok=True)
    with open(contents_path, 'w') as f:
        json.dump(data, f, indent=2)

def process_branding(root_dir):
    source_icon, source_splash = find_assets(root_dir)
    
    # 1. Target Directories Discovery / Fallbacks
    target_icon_dir = os.path.join(root_dir, 'ios/App/App/Assets.xcassets/AppIcon.appiconset')
    target_splash_dir = os.path.join(root_dir, 'ios/App/App/Assets.xcassets/Splash.imageset')
    public_dir = os.path.join(root_dir, 'public')
    
    has_ios = os.path.exists(os.path.join(root_dir, 'ios'))
    if has_ios:
        os.makedirs(target_icon_dir, exist_ok=True)
        os.makedirs(target_splash_dir, exist_ok=True)
        generate_contents_json(target_icon_dir, 'icon')
        generate_contents_json(target_splash_dir, 'splash')
    
    os.makedirs(public_dir, exist_ok=True)

    # 2. Process App Icon
    if source_icon:
        print("🎨 Generating App Icon (Xcode 1024x1024, Alpha removed)...")
        try:
            with Image.open(source_icon) as im:
                # Resize and save without transparency (RGB)
                rgb_icon = im.convert('RGB')
                resized_icon = rgb_icon.resize((1024, 1024), Image.Resampling.LANCZOS)
                
                if has_ios:
                    resized_icon.save(os.path.join(target_icon_dir, 'AppIcon-512@2x.png'), 'PNG')
                    print(f"  ✓ iOS Icon saved: AppIcon-512@2x.png")
        except Exception as e:
            print(f"❌ Error generating iOS App Icon: {e}")

    # 3. Process Splash Screen
    if source_splash:
        print("🌌 Generating Universal Splash Screens (2732x2732)...")
        try:
            bg_color = get_top_left_pixel_color(source_splash)
            hex_color = '#{:02x}{:02x}{:02x}'.format(*bg_color)
            print(f"  🎨 Sampled Background Color: {hex_color}")
            
            with Image.open(source_splash) as im:
                # Maintain aspect ratio and center on a square background
                ratio = min(2732 / im.width, 2732 / im.height)
                new_size = (int(im.width * ratio), int(im.height * ratio))
                resized_splash = im.resize(new_size, Image.Resampling.LANCZOS)
                
                # Create square background and paste resized image in the center
                canvas = Image.new("RGB", (2732, 2732), bg_color)
                x = (2732 - new_size[0]) // 2
                y = (2732 - new_size[1]) // 2
                canvas.paste(resized_splash, (x, y))
                
                if has_ios:
                    # Save universal iOS splash files
                    canvas.save(os.path.join(target_splash_dir, 'splash-2732x2732.png'), 'PNG')
                    canvas.save(os.path.join(target_splash_dir, 'splash-2732x2732-1.png'), 'PNG')
                    canvas.save(os.path.join(target_splash_dir, 'splash-2732x2732-2.png'), 'PNG')
                    print(f"  ✓ iOS Splash screens saved: 1x, 2x, 3x scales")
        except Exception as e:
            print(f"❌ Error generating iOS Splash Screen: {e}")

    # 4. Process PWA / Web Assets
    if source_icon:
        print("🌐 Generating Web and PWA icons...")
        try:
            with Image.open(source_icon) as im:
                rgba_im = im.convert('RGBA')
                
                # Apple touch icon (180x180)
                rgba_im.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'apple-touch-icon-180x180.png'), 'PNG')
                
                # PWA sizes
                for size in [64, 192, 512]:
                    rgba_im.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(public_dir, f'pwa-{size}x{size}.png'), 'PNG')
                    
                # Maskable (512x512)
                rgba_im.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'maskable-icon-512x512.png'), 'PNG')
                
                # Favicon PNG (32x32)
                rgba_im.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon.png'), 'PNG')
                
                # Favicon ICO (48x48)
                rgba_im.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon.ico'), 'ICO' if hasattr(Image, 'ICO') else 'PNG')
                
                print("  ✓ Web assets generated under public/ folder")
        except Exception as e:
            print(f"❌ Error generating PWA Web Icons: {e}")

    print("\n🎉 Standing branding updates completed successfully!")

if __name__ == "__main__":
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    process_branding(root_dir)
