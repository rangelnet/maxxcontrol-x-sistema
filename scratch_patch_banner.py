import re

path = r'r:\Users\Usuario\Meu Drive\Painel site Mxxcontrol-x-sistema\web\src\pages\BannerGenerator.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir o bloco do grid-cols-4 (garantindo que já está lg:grid-cols-4 ou mudando)
content = content.replace('lg:grid-cols-3 gap-6', 'lg:grid-cols-4 gap-6')

# Localizar o bloco de Cromatismo Elite e substituí-lo + adicionar os novos campos
old_block = r'''                   <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] block ml-1">Cromatismo Elite</label>
                      <div className="flex gap-3">
                         <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center p-1 px-4 gap-4">
                            <input type="color" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                               className="h-10 w-10 bg-transparent cursor-pointer rounded-lg border-none" />
                            <input type="text" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                               className="bg-transparent border-none text-white font-mono uppercase text-sm w-full outline-none" />
                         </div>
                      </div>
                   </div>
                </div>'''

new_block = r'''                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] block ml-1">Cromatismo Elite</label>
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center p-1 px-4 gap-4 h-[52px]">
                         <input type="color" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                            className="h-8 w-8 bg-transparent cursor-pointer rounded-lg border-none" />
                         <input type="text" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                            className="bg-transparent border-none text-white font-mono uppercase text-xs w-full outline-none" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] block ml-1">Tipografia</label>
                      <select 
                        value={themeFormData.config.font_family} 
                        onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, font_family: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl h-[52px] px-6 text-white outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer font-bold text-xs"
                      >
                        <option value="Inter">INTER (Sleek)</option>
                        <option value="Outfit">OUTFIT (Modern)</option>
                        <option value="Roboto">ROBOTO (Classic)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] block ml-1">HUD Extra</label>
                      <button 
                        type="button"
                        onClick={() => setThemeFormData({...themeFormData, config: {...themeFormData.config, show_synopsis: !themeFormData.config.show_synopsis}})}
                        className={`w-full h-[52px] rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${themeFormData.config.show_synopsis ? 'bg-brand-500/20 border-brand-500 text-brand-500' : 'bg-black/20 border-white/5 text-zinc-600'}`}
                      >
                        {themeFormData.config.show_synopsis ? 'SINOPSE ATIVA' : 'SINOPSE OCULTA'}
                      </button>
                   </div>
                </div>

                <div className="space-y-6 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <h4 className="text-[10px] font-black text-zinc-500 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                    <Monitor size={14} /> Calibração Mestre de Layout
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Poster Eixo X: {themeFormData.config.poster_x}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={themeFormData.config.poster_x} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_x: parseInt(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Poster Eixo Y: {themeFormData.config.poster_y}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={themeFormData.config.poster_y} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_y: parseInt(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Escala: {themeFormData.config.poster_scale}x</span>
                        </div>
                        <input type="range" min="0.5" max="2" step="0.1" value={themeFormData.config.poster_scale} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_scale: parseFloat(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                  </div>
                </div>'''

# Tentar substituição resiliente ignorando espaços extras no início das linhas se necessário, 
# mas aqui usarei o padrão exato encontrado no arquivo (baseado no view_file)
content = content.replace(old_block, new_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
